import asyncio
from datetime import date, timedelta
from app.core.database import async_session_factory, engine, Base
from app.core.security import get_password_hash
from app.models import User, ParkingSpot, SpotImage, Booking


async def seed():
    print("Iniciando creación de tablas y datos semilla para CocheraVecina...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        # Check if already seeded
        from sqlalchemy import select
        res = await session.execute(select(User).where(User.email == "anfitrion@cocheravecina.mx"))
        if res.scalars().first():
            print("La base de datos ya contiene datos semilla.")
            return

        # 1. Crear usuarios demo
        host = User(
            id="demo-host-leon",
            email="anfitrion@cocheravecina.mx",
            hashed_password=get_password_hash("Password123!"),
            full_name="Guillermo Navarro",
            phone="+524771234567",
            stripe_account_id="acct_demo_host_leon",
            identity_status="verified",
        )
        guest = User(
            id="demo-guest-viajero",
            email="viajero@cocheravecina.mx",
            hashed_password=get_password_hash("Password123!"),
            full_name="Sofía Valenzuela",
            phone="+524779876543",
            identity_status="verified",
        )
        session.add_all([host, guest])
        await session.flush()

        # 2. Crear cocheras en León, GTO
        spot1 = ParkingSpot(
            id="spot-poliforum",
            host_id=host.id,
            title="Cochera techada con portón eléctrico frente a Poliforum León",
            description="Espacio privado y seguro ubicado en colonia La Martinica, a 4 minutos caminando de Poliforum León y del Estadio. Ideal para viajeros y asistentes a eventos.",
            address_line="Paseo de los Niños 210",
            city="León",
            state="Guanajuato",
            country="MX",
            postal_code="37500",
            latitude=21.1152,
            longitude=-101.6548,
            price_per_day=18000,  # $180 MXN
            vehicle_size="suv",
            space_type="covered",
            access_instructions="Tocar el interfón 2B o enviar WhatsApp al llegar para apertura de portón.",
        )
        spot2 = ParkingSpot(
            id="spot-plaza-mayor",
            host_id=host.id,
            title="Cajón privado techado en fraccionamiento cerrado en Zona Norte",
            description="Excelente cochera techada en clúster residencial con caseta de vigilancia 24/7 cerca de Plaza Mayor. Tu vehículo estará 100% resguardado de lluvia y sol.",
            address_line="Blvd. Campestre 1420",
            city="León",
            state="Guanajuato",
            country="MX",
            postal_code="37150",
            latitude=21.1590,
            longitude=-101.6980,
            price_per_day=15000,  # $150 MXN
            vehicle_size="sedan",
            space_type="covered",
            access_instructions="Identificarse con el guardia de caseta con el nombre del anfitrión.",
        )
        spot3 = ParkingSpot(
            id="spot-bjx-airport",
            host_id=host.id,
            title="Cochera segura a 12 minutos de Aeropuerto del Bajío (BJX)",
            description="Espacio amplio para camioneta o sedán sobre salida a Silao / Aeropuerto. Mucho más económico que las tarifas diarias del estacionamiento oficial de BJX.",
            address_line="Carretera León-Silao Km 150",
            city="León",
            state="Guanajuato",
            country="MX",
            postal_code="37295",
            latitude=21.0500,
            longitude=-101.5500,
            price_per_day=14000,  # $140 MXN
            vehicle_size="truck",
            space_type="covered",
            access_instructions="Coordinar horario de llegada para traslado rápido en Uber a la terminal si lo necesitas.",
        )
        session.add_all([spot1, spot2, spot3])
        await session.flush()

        # 3. Crear una reserva de demostración
        start = date.today() + timedelta(days=2)
        end = start + timedelta(days=4)
        booking = Booking(
            id="demo-booking-1",
            spot_id=spot1.id,
            guest_id=guest.id,
            start_date=start,
            end_date=end,
            status="approved",
            daily_rate=18000,
            total_days=4,
            base_amount=72000,
            guest_fee_amount=7200,
            host_fee_amount=3600,
            total_amount=79200,
            host_payout_amount=68400,
            currency="MXN",
        )
        session.add(booking)
        await session.commit()
        print("SUCCESS: Datos semilla cargados con exito en Leon, Guanajuato.")


if __name__ == "__main__":
    asyncio.run(seed())
