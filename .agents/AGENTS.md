# Admin Dashboard - Project Rules

## Response Serialization
- Always use `plainToInstance(UserResponseDto, data, { excludeExtraneousValues: true })` when returning user data from controllers or use cases.
- Never return raw User entities directly from controllers.
- Only fields marked with `@Expose()` in `UserResponseDto` will be included in the response.

## DTO Decorators
- Do NOT use `@Expose()` in Request DTOs (CreateUserDto, UpdateUserDto, LoginDto, etc.). The `whitelist: true` option in ValidationPipe combined with class-validator decorators handles whitelisting automatically.
- Only use `@Expose()` in Response DTOs (e.g., UserResponseDto) where `plainToInstance` with `excludeExtraneousValues: true` is used for filtering.

## Swagger & Controller Best Practices
- Place `@UseGuards()` and `@Roles()` at the class level when all endpoints share the same guards.
- Place `@ApiBearerAuth()` only on protected endpoints/controllers, NOT on public endpoints like login.
- Use `@ApiTags()` on every controller for clear grouping in Swagger UI.
- Always add examples to `@ApiProperty()` in DTOs for better Swagger documentation.
