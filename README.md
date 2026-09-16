# CocheraVecina — Marketplace de Renta de Cocheras en México

Marketplace peer-to-peer tipo Airbnb enfocado en **estancias cortas para viajeros (2 a 15 días)** en México, con piloto inicial en León, Guanajuato.

---

## 🏛️ Arquitectura del Sistema

- **Backend**: FastAPI (Python 3.12) con SQLAlchemy 2.0 Async (`asyncpg` / `aiosqlite`), Pydantic v2 y PyJWT.
- **Transacciones ACID**: Transacciones atómicas explícitas (`atomic_transaction`) con bloqueo pesimista de filas (`with_for_update`) para prevenir double-bookings concurrentes.
- **Frontend**: Next.js 14 (App Router, React 18, TypeScript, Tailwind CSS, Lucide Icons).
- **Base de Datos**: PostgreSQL 16 (o SQLite para desarrollo local sin Docker).
- **Pagos**: Stripe Connect con cuentas Express para anfitriones mexicanos y **Destination Charges** con desglose automático de comisión (`application_fee_amount`).
- **Despliegue**: Docker Compose optimizado para **Coolify** sobre VPS de Hetzner.

---

## 💰 Modelo de Comisiones & Stripe Connect

Desglose de comisión sobre cada reserva:

$$\text{Total Huésped} = \text{Tarifa Base} + 10\% \text{ Tarifa de Servicio (Huésped)}$$
$$\text{Payout Anfitrión} = \text{Tarifa Base} - 5\% \text{ Comisión Anfitrión}$$
$$\text{Ganancia Plataforma (Application Fee)} = 10\% + 5\% = 15\%$$

Stripe Connect transfiere automáticamente el neto al anfitrión y acredita la comisión de la plataforma en una sola transacción segura.

### Política de Cancelación Flexible
- Cancelación con **100% de reembolso automático** si se cancela con al menos **24 horas de anticipación** al check-in (o si el anfitrión cancela).
- Stripe revierte el pago con `reverse_transfer=True` y `refund_application_fee=True`.

---

## 🚀 Puesta en Marcha Local

### 1. Variables de entorno
Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

### 2. Backend (FastAPI)
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- Documentación OpenAPI Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)
- Healthcheck: [http://localhost:8000/health](http://localhost:8000/health)

### 3. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
- Aplicación web: [http://localhost:3000](http://localhost:3000)

### 4. Ejecución de Pruebas Automatizadas
```bash
cd backend
python -m pytest -v
```

---

## 🐳 Despliegue en Coolify / VPS Hetzner

El repositorio incluye `docker-compose.yml` preconfigurado:
1. En el panel de **Coolify**, crea un nuevo recurso tipo **Docker Compose**.
2. Conecta tu repositorio de GitHub.
3. Define las variables de entorno en Coolify (`SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `FRONTEND_URL`).
4. Haz clic en **Deploy**. Coolify levantará los contenedores de Postgres, FastAPI y Next.js con reinicio automático y certificados SSL vía Traefik.
