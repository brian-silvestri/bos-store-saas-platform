# Configuración de Secretos - BOS Store Backend

## ⚠️ IMPORTANTE: Configuración Requerida

Este proyecto utiliza **User Secrets** para manejar información sensible de forma segura. Los secretos NO deben estar en el repositorio.

## Configuración Rápida

### 1. Inicializar User Secrets

```bash
cd backend_bos/src/BosStore.API
dotnet user-secrets init
```

### 2. Configurar Connection String

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=bosstore;Username=postgres;Password=TU_PASSWORD_AQUI"
```

### 3. Configurar JWT Secret Key

```bash
dotnet user-secrets set "JwtSettings:SecretKey" "TU_SECRET_KEY_MINIMO_32_CARACTERES_SUPER_SECRETO"
```

## Generación de Secret Key Seguro

Usa este comando para generar una clave segura:

**PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
```

**Linux/Mac:**
```bash
openssl rand -base64 48
```

## Verificar Secretos Configurados

```bash
dotnet user-secrets list
```

## Variables de Entorno (Producción)

En producción, configura estas variables de entorno:

```bash
ConnectionStrings__DefaultConnection="tu_connection_string"
JwtSettings__SecretKey="tu_secret_key"
```

## Ejemplo de appsettings.json

El archivo `appsettings.json` NO debe contener secretos. Ver `appsettings.Example.json` para referencia.

## Troubleshooting

Si obtienes errores de configuración:
1. Verifica que los secretos estén configurados: `dotnet user-secrets list`
2. Verifica que el UserSecretsId esté en el .csproj
3. Reinicia el servidor después de configurar secretos
