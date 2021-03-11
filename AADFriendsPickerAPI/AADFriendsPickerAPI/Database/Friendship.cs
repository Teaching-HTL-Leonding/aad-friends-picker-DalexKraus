namespace AADFriendsPickerAPI.Database
{
    public class Friendship
    {
        public int Id { get; set; }

        public string FirstUserId { get; set; }
        public string SecondUserId { get; set; }
    }
}
