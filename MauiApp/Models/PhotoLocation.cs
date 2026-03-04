using SQLite;

namespace FotoUbicacion.Models;

[Table("Photos")]
public class PhotoLocation
{
    [PrimaryKey, AutoIncrement]
    public int Id { get; set; }

    /// <summary>Ruta local en la galería del dispositivo</summary>
    [NotNull]
    public string ImagePath { get; set; } = string.Empty;

    /// <summary>Latitud GPS al momento de la captura</summary>
    [NotNull]
    public double Latitude { get; set; }

    /// <summary>Longitud GPS al momento de la captura</summary>
    [NotNull]
    public double Longitude { get; set; }

    /// <summary>Dirección aproximada (reverse-geocoding)</summary>
    public string? Address { get; set; }

    /// <summary>Fecha y hora de la captura</summary>
    public DateTime CapturedAt { get; set; } = DateTime.Now;
}
