using FotoUbicacion.Models;
using FotoUbicacion.Services;

namespace FotoUbicacion.Pages;

public partial class HistorialPage : ContentPage
{
    private readonly DatabaseService _db;

    public HistorialPage(DatabaseService db)
    {
        InitializeComponent();
        _db = db;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await LoadDataAsync();
    }

    private async Task LoadDataAsync()
    {
        var photos = await _db.GetAllAsync();
        PhotoList.ItemsSource = photos;
        CountLabel.Text = $"{photos.Count} registro{(photos.Count == 1 ? "" : "s")}";
    }

    private async void OnDeleteClicked(object sender, EventArgs e)
    {
        if (sender is not Button btn || btn.CommandParameter is not PhotoLocation photo)
            return;

        bool confirm = await DisplayAlert("Eliminar",
            "¿Deseas eliminar este registro?", "Sí", "No");
        if (!confirm) return;

        await _db.DeleteAsync(photo);
        await LoadDataAsync();
    }
}
