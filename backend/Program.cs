using backend;
using backend.Authorization;
using backend.DatabaseContext;
using backend.Logic;
using backend.Storage;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

AppSettings.Initialize(builder.Configuration);

// Add services to the container.

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://accounts.google.com";
        options.Audience = AppSettings.googleOAuthClientId;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuers = ["https://accounts.google.com", "accounts.google.com"],
            ValidateAudience = true,
            ValidAudience = AppSettings.googleOAuthClientId,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
        };
        options.MapInboundClaims = false;
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AuthPolicies.NotBlocked, policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.AddRequirements(new NotBlockedRequirement());
    });
});
builder.Services.AddScoped<IAuthorizationHandler, NotBlockedAuthorizationHandler>();
builder.Services.AddScoped<JwtHelper>();

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var dataSourceBuilder = new NpgsqlDataSourceBuilder(AppSettings.databaseConnectionString);
dataSourceBuilder.EnableDynamicJson();

var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<AppDbContext>(options => 
    options.UseNpgsql(dataSource)
);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.SetIsOriginAllowed(_ => true)
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials();
    });
});

builder.Services.AddScoped<DatabaseManager>();
builder.Services.AddScoped<StorageManager>(_ => new StorageManager(new StorageManagerOptions
{
    ServiceUrl = AppSettings.storageServiceUrl,
    AccessKey = AppSettings.storageAccessKey,
    SecretKey = AppSettings.storageSecretKey,
    BucketName = AppSettings.storageBucketName,
}));
builder.Services.AddScoped<ApiHelper>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);


app.Run();
