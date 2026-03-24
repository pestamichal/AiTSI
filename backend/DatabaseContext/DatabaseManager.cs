using backend.DatabaseContext.DatabaseModels;
using backend.DatabaseContext.Dtos;
using Microsoft.EntityFrameworkCore;
using backend.Storage;

namespace backend.DatabaseContext
{
    public class DatabaseManager : IDisposable
    {

        private readonly AppDbContext _context;
        
        public DatabaseManager(AppDbContext context)
        {
            _context = context;
        }

        public void Dispose()
        {
            
        }

        #region Photos
        // TODO
        public async Task<List<Photo>> SearchPhotos(){
            // For now return all photos
            return await _context.Photos.ToListAsync();
        }

        public async Task<Photo?> GetPhotoAsync(Guid photoId){
            return await _context.Photos.Where(p => p.Id == photoId).FirstOrDefaultAsync();
        }

        public async Task<bool> DeletePhotoAsync(Guid photoId){
            Photo? photoToDelete = await _context.Photos.FindAsync(photoId);
            if(photoToDelete == null){
                return false;
            }
            _context.Photos.Remove(photoToDelete);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Photo> CreatePhoto(CreatePhotoDto photoDto)
        {
            Guid photoId = photoDto.Id ?? Guid.NewGuid();
            var photo = new Photo
            {
                Id = photoId,
                Title = photoDto.Title,
                Description = photoDto.Description,
                PhotoUrl = photoDto.PhotoUrl,
                FileExtension = photoDto.FileExtension,
                Author = photoDto.Author,
                YearTaken = photoDto.YearTaken,
                MonthTaken = photoDto.MonthTaken,
                DayTaken = photoDto.DayTaken,
                CountryId = photoDto.CountryId,
                VoivodeshipId = photoDto.VoivodeshipId,
                CountyId = photoDto.CountyId,
                CityId = photoDto.CityId,
                CreatedAt = DateTime.Now
            };

            _context.Photos.Add(photo);
            await _context.SaveChangesAsync();
            return photo;
        }

        #endregion

        #region UserInfo

        public async Task<bool> IsUserBlocked(string email){
            BlockedUsers? user = await _context.BlockedUsers
                            .Where(u => u.Email == email)
                            .SingleOrDefaultAsync();
            return user != null;
        }

        public async Task<bool> IsAdmin(string email){
            Admins? admin = await _context.Admins
                            .Where(a => a.Email == email)
                            .SingleOrDefaultAsync();
            return admin != null;
        }

        public async Task<bool> BlockUserAsync(string email){
            Admins? admin = await _context.Admins.Where(a => a.Email == email).FirstOrDefaultAsync();
            if(admin != null){
                return false;
            }

            BlockedUsers blockedUser = new BlockedUsers(){
                Id = Guid.NewGuid(),
                Email = email
            };
            _context.BlockedUsers.Add(blockedUser);
            await _context.SaveChangesAsync();
            return true;
        }

        #endregion

        #region Locations

        public async Task<List<Country>> GetTerritorialTreeAsync()
        {
            return await _context.Countries
                .Include(c => c.Voivodeships)
                    .ThenInclude(v => v.Counties)
                        .ThenInclude(co => co.Cities)
                .AsNoTracking()
                .ToListAsync();
        }

        #endregion

        #region Countries

        public async Task<Country?> GetCountryAsync(string countryName)
        {
        
            return await _context.Countries
                .Where(c => c.Name == countryName)
                .SingleOrDefaultAsync();
            
        }

        #endregion

        #region Voivodeships

        public async Task<Voivodeship?> GetVoivodeshipAsync(string voivodeshipName)
        {
            return await _context.Voivodeships
                .Where(v => v.Name == voivodeshipName)
                .SingleOrDefaultAsync();
        }

        public async Task<List<Voivodeship>> GetVoivodeshipsByCountryAsync(int countryId)
        {
            return await _context.Voivodeships
                .Where(v => v.CountryId == countryId)
                .ToListAsync();
        }

        #endregion

        #region Counties

        public async Task<County?> GetCountyAsync(string countyName)
        {

            return await _context.Counties
                .Where(c => c.Name == countyName)
                .SingleOrDefaultAsync();

        }

        public async Task<List<County>> GetCountiesByVoivodeshipAsync(int voivodeshipId)
        {
            return await _context.Counties
                .Where(c => c.VoivodeshipId == voivodeshipId)
                .ToListAsync();
        }

        #endregion

        #region Cities

        public async Task<City?> GetCityAsync(string cityName)
        {
            return await _context.Cities
                .Where(c => c.Name == cityName)
                .SingleOrDefaultAsync();
        }

        public async Task<List<City>> GetCitiesByCountyAsync(int countyId)
        {
            return await _context.Cities
                .Where(c => c.CountyId == countyId)
                .ToListAsync();
        }

        #endregion
    }
}
