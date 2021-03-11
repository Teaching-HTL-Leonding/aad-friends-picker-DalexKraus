using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AADFriendsPickerAPI.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;

namespace AADFriendsPickerAPI.Controllers
{
    [Route("api/[controller]")]
    public class FriendsController : Controller
    {
        private readonly FriendsDbContext _context;
        public FriendsController(FriendsDbContext context) => _context = context;

        [Route("getAll")]
        [HttpGet]
        [Authorize]
        public async Task<IEnumerable<string>> GetAll()
        {
            var userId = HttpContext.User.Claims.First(c => c.Type == ClaimConstants.ObjectId).Value;
            var friendIds = await _context.Friendships.Where(f => f.FirstUserId == userId || f.SecondUserId == userId).ToArrayAsync();
            return friendIds.Select(f => (f.FirstUserId == userId) ? f.SecondUserId : f.FirstUserId);
        }
    }
}
