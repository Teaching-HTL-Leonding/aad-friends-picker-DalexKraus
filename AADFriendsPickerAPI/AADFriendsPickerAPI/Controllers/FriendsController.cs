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
        
        public record AddFriendModel(string FriendId);

        [Route("getAll")]
        [HttpGet]
        [Authorize]
        public async Task<IEnumerable<string>> GetAll()
        {
            var userId = HttpContext.User.Claims.First(c => c.Type == ClaimConstants.ObjectId).Value;
            var friendShips = await _context.Friendships.Where(f => f.FirstUserId == userId || f.SecondUserId == userId).ToArrayAsync();
            var friendIds = friendShips.Select(f => (f.FirstUserId == userId) ? f.SecondUserId : f.FirstUserId);
            return friendIds;
        }

        [Route("isFriend")]
        [HttpPost]
        [Authorize]
        public async Task<bool> IsFriend([FromBody] string friendId)
        {
            return (await GetAll()).Any(f => f == friendId);
        }
        
        [Route("add")]
        [HttpPost]
        [Authorize]
        public async Task<IEnumerable<string>> AddFriend([FromBody] AddFriendModel model)
        {
            var friendId = model.FriendId;
            // Check if the user is not already friends with the given person
            if (!await IsFriend(friendId))
            {
                await using var transaction = await _context.Database.BeginTransactionAsync();
                var friendShip = new Friendship
                {
                    FirstUserId = HttpContext.User.Claims.First(c => c.Type == ClaimConstants.ObjectId).Value,
                    SecondUserId = friendId
                };
                await _context.Friendships.AddAsync(friendShip);
            
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }

            return await GetAll();
        }
    }
}
