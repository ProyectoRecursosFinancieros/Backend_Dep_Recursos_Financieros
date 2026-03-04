using FotoUbicacion.Models;
using SQLite;

namespace FotoUbicacion.Services;

public class DatabaseService
{
    private SQLiteAsyncConnection? _db;

    private static string DbPath =>
        Path.Combine(FileSystem.AppDataDirectory, "fotoubicacion.db3");

    private async Task InitAsync()
    {
        if (_db is not null) return;
        _db = new SQLiteAsyncConnection(DbPath, SQLiteOpenFlags.ReadWrite | SQLiteOpenFlags.Create | SQLiteOpenFlags.SharedCache);
        await _db.CreateTableAsync<PhotoLocation>();
    }

    public async Task<List<PhotoLocation>> GetAllAsync()
    {
        await InitAsync();
        return await _db!.Table<PhotoLocation>().OrderByDescending(p => p.CapturedAt).ToListAsync();
    }

    public async Task<int> SaveAsync(PhotoLocation photo)
    {
        await InitAsync();
        if (photo.Id == 0)
            return await _db!.InsertAsync(photo);
        return await _db!.UpdateAsync(photo);
    }

    public async Task<int> DeleteAsync(PhotoLocation photo)
    {
        await InitAsync();
        return await _db!.DeleteAsync(photo);
    }
}
