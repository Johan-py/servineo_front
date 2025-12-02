# 🗓️ FRONTEND - Integración Google Calendar (FASE 2)

## Estado Actual
- ✅ Backend: GoogleCalendarService completado
- ✅ Backend: Middleware de autenticación creado
- ⏳ Frontend: Necesita enviar accessToken a backend

## Pasos para Implementar

### 1. Extraer accessToken del contexto de Google Auth
**Archivo**: `src/app/google/hooks/useGoogleAuth.tsx`

Actualmente obtiene el token pero probablemente no lo guarda. Necesitamos:

```typescript
// En useGoogleAuth, agregar estado para guardar token
const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

// Cuando se autentica exitosamente:
const handleAuthSuccess = (response: any) => {
  const token = response.credential; // o response.access_token según respuesta
  setGoogleAccessToken(token);
  localStorage.setItem('googleAccessToken', token); // Guardar para luego
};
```

### 2. Crear Servicio de Citas con sincronización
**Archivo Nuevo**: `src/services/citaService.ts`

```typescript
export const createCitaWithCalendarSync = async (
  citaData: any,
  googleAccessToken?: string
) => {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const response = await fetch(
    `${API_BASE}/api/devcode/citas`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // ✅ Pasar token en Authorization si existe
        ...(googleAccessToken && {
          'Authorization': `Bearer ${googleAccessToken}`
        })
      },
      body: JSON.stringify(citaData),
    }
  );

  if (!response.ok) {
    throw new Error('Error creando cita');
  }

  return response.json();
};

export const updateCitaWithCalendarSync = async (
  citaId: string,
  citaData: any,
  googleAccessToken?: string
) => {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const response = await fetch(
    `${API_BASE}/api/devcode/citas/${citaId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(googleAccessToken && {
          'Authorization': `Bearer ${googleAccessToken}`
        })
      },
      body: JSON.stringify(citaData),
    }
  );

  return response.json();
};

export const deleteCitaWithCalendarSync = async (
  citaId: string,
  googleAccessToken?: string
) => {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const response = await fetch(
    `${API_BASE}/api/devcode/citas/${citaId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(googleAccessToken && {
          'Authorization': `Bearer ${googleAccessToken}`
        })
      },
    }
  );

  return response.json();
};
```

### 3. Actualizar AppointmentModal
**Archivo**: `src/app/booking/agenda/components/appointment-modal.tsx`

Cambiar la llamada a la API para usar el servicio y pasar el token:

```typescript
// ANTES:
await fetch(`${API_BASE}/api/devcode/citas`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});

// DESPUÉS:
import { createCitaWithCalendarSync } from '@/services/citaService';

const googleAccessToken = localStorage.getItem('googleAccessToken');

const result = await createCitaWithCalendarSync(payload, googleAccessToken);
```

### 4. Actualizar CitasAgendadas para edición
**Archivo**: `src/app/booking/agenda/components/CitasAgendadas.tsx`

Cuando se edita una cita:

```typescript
import { updateCitaWithCalendarSync } from '@/services/citaService';

const handleUpdateCita = async (citaId: string, newData: any) => {
  const googleAccessToken = localStorage.getItem('googleAccessToken');
  
  const result = await updateCitaWithCalendarSync(
    citaId,
    newData,
    googleAccessToken
  );
  
  if (result.success) {
    // Refrescar lista de citas
    fetchCitas();
  }
};
```

### 5. Actualizar useCurrentClienteId para incluir token
**Archivo**: `src/config/userConfig.ts`

```typescript
export const useCurrentGoogleAuth = () => {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('googleAccessToken') 
    : null;
  
  return {
    clienteId: CURRENT_USER_CONFIG.clienteId,
    googleAccessToken: token,
    hasGoogleAuth: !!token,
  };
};
```

## Flujo Completo

```
┌─────────────────────────────────┐
│ Usuario Autentica con Google    │
│ (login epic)                    │
└──────────────┬──────────────────┘
               │
        ┌──────▼────────────┐
        │ Obtener accessToken
        │ Guardar en localStorage
        └──────┬────────────┘
               │
        ┌──────▼──────────────────┐
        │ Usuario Crea Cita       │
        │ AppointmentModal        │
        └──────┬──────────────────┘
               │
        ┌──────▼──────────────────────┐
        │ POST /api/devcode/citas     │
        │ + Header: Authorization    │
        │         Bearer <token>     │
        └──────┬──────────────────────┘
               │ (Backend)
        ┌──────▼─────────────────────┐
        │ 1. Guardar en MongoDB      │
        │ 2. Crear en Google Calendar│
        │ 3. Guardar googleEventId   │
        └──────┬─────────────────────┘
               │
        ┌──────▼─────────────────────┐
        │ Response 201 Created       │
        │ { cita con googleEventId } │
        └────────────────────────────┘
```

## Testing sin Login Epic

Mientras la epic de login no esté lista, puedes probar de dos formas:

### Opción A: Token Hardcodeado
```typescript
// src/config/userConfig.ts
export const CURRENT_USER_CONFIG = {
  clienteId: "6927e784567c50dddae45310",
  googleAccessToken: "ya.a0AfH6...",  // Token de prueba
};
```

### Opción B: Usar Google OAuth2 Playground
1. Ir a https://developers.google.com/oauthplayground
2. Autorizar con Google Calendar
3. Copiar accessToken
4. Pasar en headers de requests

## Validación

✅ **Test 1**: Crear cita sin token
- Debe crearse normalmente en BD
- googleCalendarSynced será false

✅ **Test 2**: Crear cita con token válido
- Debe crearse en BD
- Debe aparecer en Google Calendar del usuario
- googleEventId se guardará en cita

✅ **Test 3**: Editar cita con token
- Cambios deben reflejarse en Google Calendar

✅ **Test 4**: Eliminar cita con token
- Debe eliminarse de Google Calendar también

## Errores Comunes

### "Cannot find module 'googleapis'"
Solución: Ya está instalado en backend (`npm install googleapis`)

### "Google Event ID no se actualiza"
Causas:
1. Token expirado o inválido
2. Permisos insuficientes en Google Cloud
3. Middleware no extrae token correctamente

### "Event created but not visible in calendar"
Soluciones:
1. Verificar timezone en GoogleCalendarService (ahora: America/Bogota)
2. Cambiar según tu zona horaria
3. Verificar permisos en Google Calendar API

## Próximos Pasos

1. ✅ Backend: GoogleCalendarService (COMPLETADO)
2. ⏳ Frontend: Integrar autenticación con token
3. ⏳ Frontend: Actualizar componentes para pasar token
4. ⏳ Testing: Verificar sincronización bidireccional
5. ⏳ Producción: Usar OAuth2 flow completo con refresh tokens

## Recursos

- [Google Calendar API](https://developers.google.com/calendar/api)
- [OAuth 2.0 Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
- [Timezone Database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
