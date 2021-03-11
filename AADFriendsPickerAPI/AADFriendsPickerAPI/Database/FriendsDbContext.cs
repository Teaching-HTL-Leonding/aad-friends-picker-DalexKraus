using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace AADFriendsPickerAPI.Database
{
    public class FriendsDbContext : DbContext
    {
        public DbSet<Friendship> Friendships { get; set; }

        public FriendsDbContext(DbContextOptions<FriendsDbContext> options)
            : base(options)
        { }
    }
}
