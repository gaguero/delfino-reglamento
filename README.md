# Reglamento Asamblea Legislativa CR

Aplicación web de anotación del Reglamento de la Asamblea Legislativa de Costa Rica para Delfino.cr

## Características

- 📖 Lectura pública de artículos anotados del Reglamento
- ✏️ Edición de anotaciones (usuarios autorizados @delfino.cr)
- 🔗 Gestión de referencias legales (votos, actas, leyes)
- 📊 Panel de administración con dashboard
- 🔍 Auditoría completa de cambios
- 🔐 Autenticación restringida por dominio

## Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Base de datos**: PostgreSQL + Prisma ORM
- **Autenticación**: Auth.js v5 (NextAuth.js)
- **Editor**: TipTap
- **Estilos**: Tailwind CSS + shadcn/ui
- **Deployment**: Railway

## Requisitos Previos

- Node.js 18+
- PostgreSQL 14+

## Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd delfino-reglamento
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env .env.local
```

Editar `.env.local` con tus valores:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/delfino_reglamento"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generar-con-openssl-rand-base64-32>"
```

4. Ejecutar migraciones y seed:
```bash
npx prisma migrate dev
npx prisma db seed
```

5. Iniciar servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Acceso por Defecto

**Usuario Master:**
- Email: `gagueromesen@gmail.com`
- Contraseña: `ChangeMe2024!` (cambiar inmediatamente)

## Estructura del Proyecto

```
delfino-reglamento/
├── app/                    # Next.js App Router
│   ├── (public)/          # Rutas públicas
│   ├── admin/             # Panel de administración
│   └── api/               # API routes
├── components/            # Componentes React
├── lib/                   # Utilidades y configuración
├── prisma/                # Schema y migraciones
│   ├── schema.prisma
│   └── seed.ts
└── types/                 # TypeScript definitions
```

## Deployment a Railway

1. Crear proyecto en Railway:
```bash
railway init
```

2. Provisionar PostgreSQL:
```bash
railway add postgresql
```

3. Configurar variables de entorno en Railway:
- `DATABASE_URL` (auto-configurado por PostgreSQL)
- `NEXTAUTH_URL` (URL de producción)
- `NEXTAUTH_SECRET` (generar nuevo)
- `NODE_ENV=production`

4. Conectar repositorio GitHub y deploy automático

## Arquitectura de Base de Datos

### Tablas Principales

- `users` - Usuarios con restricción de dominio @delfino.cr
- `articulos` - Artículos del reglamento
- `anotaciones` - Anotaciones editoriales
- `referencias` - Referencias legales (votos, actas, leyes)
- `tipos_anotacion` - Tipos de anotaciones
- `tipos_referencia` - Tipos de referencias
- `audit_log` - Registro de auditoría completo

### Restricciones de Seguridad

- Email verificado a nivel de aplicación (@delfino.cr + master account)
- Rutas admin protegidas por middleware
- Auditoría automática de cambios

## Desarrollo

### Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar en producción
npm start

# Prisma Studio (GUI de base de datos)
npx prisma studio

# Generar cliente Prisma
npx prisma generate

# Crear nueva migración
npx prisma migrate dev --name <nombre>
```

## Contribuir

Este proyecto es mantenido por Delfino.cr. Solo usuarios autorizados pueden editar contenido.

## Licencia

Propiedad de Delfino.cr
