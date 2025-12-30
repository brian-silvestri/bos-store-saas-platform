namespace BosStore.API.Services;

public class LicenseCodeService
{
    private static readonly string[] AllowedChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".ToCharArray().Select(c => c.ToString()).ToArray();

    public string GenerateLicenseCode(string planPrefix)
    {
        var segment1 = GenerateRandomSegment(4);
        var segment2 = GenerateRandomSegment(4);
        return $"BOS-{planPrefix.ToUpper()}-{segment1}-{segment2}";
    }

    private string GenerateRandomSegment(int length)
    {
        var random = new Random();
        var result = new char[length];

        for (int i = 0; i < length; i++)
        {
            result[i] = AllowedChars[random.Next(AllowedChars.Length)][0];
        }

        return new string(result);
    }
}
