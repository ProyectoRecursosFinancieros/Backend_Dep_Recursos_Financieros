using FotoUbicacion.Models;
using FotoUbicacion.Services;
using Microsoft.Maui.Controls.Maps;
using Microsoft.Maui.Maps;

namespace FotoUbicacion.Pages;

public partial class MainPage : ContentPage
{
    private readonly DatabaseService _db;
    private string? _currentImagePath;
    private Location? _currentLocation;

    public MainPage(DatabaseService db)
    {
        InitializeComponent();
        _db = db;
    }

    // ── Cámara ──────────────────────────────────────────────────────────────

    private async void OnTakePhotoClicked(object sender, EventArgs e)
    {
        if (!MediaPicker.Default.IsCaptureSupported)
        {
            await DisplayAlert("Error", "La cámara no está disponible en este dispositivo.", "OK");
            return;
        }

        try
        {
            SetBusy(true);
            var photo = await MediaPicker.Default.CapturePhotoAsync();
            if (photo is null) return;

            // Guardar en la carpeta de fotos del dispositivo
            var destPath = Path.Combine(FileSystem.AppDataDirectory, photo.FileName);
            using var sourceStream = await photo.OpenReadAsync();
            using var destStream = File.OpenWrite(destPath);
            await sourceStream.CopyToAsync(destStream);

            _currentImagePath = destPath;
            PreviewImage.Source = ImageSource.FromFile(destPath);

#if ANDROID
            // En Android también guardamos en el álbum de Media (galería pública)
            SaveToAndroidGallery(destPath, photo.FileName);
#endif
        }
        catch (Exception ex)
        {
            await DisplayAlert("Error", $"No se pudo capturar la foto: {ex.Message}", "OK");
        }
        finally
        {
            SetBusy(false);
        }
    }

#if ANDROID
    private static void SaveToAndroidGallery(string sourcePath, string fileName)
    {
        try
        {
            var contentValues = new Android.Content.ContentValues();
            contentValues.Put(Android.Provider.MediaStore.IMediaColumns.DisplayName, fileName);
            contentValues.Put(Android.Provider.MediaStore.IMediaColumns.MimeType, "image/jpeg");
            contentValues.Put(Android.Provider.MediaStore.IMediaColumns.RelativePath, "DCIM/FotoUbicacion");

            var resolver = Android.App.Application.Context.ContentResolver!;
            var uri = resolver.Insert(Android.Provider.MediaStore.Images.Media.ExternalContentUri!, contentValues);
            if (uri is not null)
            {
                using var output = resolver.OpenOutputStream(uri)!;
                using var input = File.OpenRead(sourcePath);
                input.CopyTo(output);
            }
        }
        catch
        {
            // Si falla guardar en la galería pública, la imagen ya está en AppDataDirectory
        }
    }
#endif

    // ── GPS ─────────────────────────────────────────────────────────────────

    private async void OnGetLocationClicked(object sender, EventArgs e)
    {
        try
        {
            SetBusy(true);

            var status = await Permissions.RequestAsync<Permissions.LocationWhenInUse>();
            if (status != PermissionStatus.Granted)
            {
                await DisplayAlert("Permiso denegado", "Se necesita permiso de ubicación.", "OK");
                return;
            }

            var request = new GeolocationRequest(GeolocationAccuracy.Medium, TimeSpan.FromSeconds(10));
            _currentLocation = await Geolocation.Default.GetLocationAsync(request);

            if (_currentLocation is null)
            {
                await DisplayAlert("GPS", "No se pudo obtener la ubicación.", "OK");
                return;
            }

            LatLabel.Text = $"Latitud: {_currentLocation.Latitude:F6}";
            LngLabel.Text = $"Longitud: {_currentLocation.Longitude:F6}";

            // Geocodificación inversa
            var placemarks = await Geocoding.Default.GetPlacemarksAsync(
                _currentLocation.Latitude, _currentLocation.Longitude);
            var place = placemarks?.FirstOrDefault();
            if (place is not null)
            {
                AddressLabel.Text = $"Dirección: {place.Thoroughfare} {place.SubThoroughfare}, " +
                                    $"{place.Locality}, {place.CountryName}";
            }

            // Mover mapa
            var mapSpan = MapSpan.FromCenterAndRadius(
                new MapLocation(_currentLocation.Latitude, _currentLocation.Longitude),
                Distance.FromKilometers(0.5));
            LocationMap.MoveToRegion(mapSpan);

            // Pin en el mapa
            LocationMap.Pins.Clear();
            LocationMap.Pins.Add(new Pin
            {
                Label = "Mi ubicación",
                Location = new MapLocation(_currentLocation.Latitude, _currentLocation.Longitude),
                Type = PinType.Place
            });
        }
        catch (Exception ex)
        {
            await DisplayAlert("Error GPS", ex.Message, "OK");
        }
        finally
        {
            SetBusy(false);
        }
    }

    // ── Guardar ─────────────────────────────────────────────────────────────

    private async void OnSaveClicked(object sender, EventArgs e)
    {
        if (_currentImagePath is null)
        {
            await DisplayAlert("Atención", "Primero toma una foto.", "OK");
            return;
        }
        if (_currentLocation is null)
        {
            await DisplayAlert("Atención", "Primero obtén la ubicación GPS.", "OK");
            return;
        }

        var record = new PhotoLocation
        {
            ImagePath = _currentImagePath,
            Latitude = _currentLocation.Latitude,
            Longitude = _currentLocation.Longitude,
            Address = AddressLabel.Text.StartsWith("Dirección: ")
                ? AddressLabel.Text["Dirección: ".Length..]
                : AddressLabel.Text,
            CapturedAt = DateTime.Now
        };

        await _db.SaveAsync(record);
        await DisplayAlert("✅ Guardado", "Registro guardado exitosamente.", "OK");

        // Limpiar estado
        _currentImagePath = null;
        _currentLocation = null;
        PreviewImage.Source = "photo_placeholder.png";
        LatLabel.Text = "Latitud: —";
        LngLabel.Text = "Longitud: —";
        AddressLabel.Text = "Dirección: —";
        LocationMap.Pins.Clear();
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private void SetBusy(bool busy)
    {
        BusyIndicator.IsRunning = busy;
        BusyIndicator.IsVisible = busy;
    }
}
