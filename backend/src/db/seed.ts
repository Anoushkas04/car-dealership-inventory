import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from './database';
import { UserRepository } from '../repositories/user.repository';
import { VehicleRepository } from '../repositories/vehicle.repository';

export async function seedDatabase() {
  const db = getDatabase();
  const userRepo = new UserRepository(db);
  const vehicleRepo = new VehicleRepository(db);

  // Seed default admin if not exists
  const existingAdmin = userRepo.findByUsername('admin');
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);
    userRepo.create({
      id: uuidv4(),
      username: 'admin',
      password: hash,
      role: 'admin',
      created_at: new Date().toISOString(),
    });
    console.log('Seeded default admin user: admin / admin123');
  }

  // Seed default customer if not exists
  const existingCustomer = userRepo.findByUsername('customer');
  if (!existingCustomer) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('customer123', salt);
    userRepo.create({
      id: uuidv4(),
      username: 'customer',
      password: hash,
      role: 'user',
      created_at: new Date().toISOString(),
    });
    console.log('Seeded default customer user: customer / customer123');
  }

  // Seed vehicles if catalog is empty
  const vehicles = vehicleRepo.findAll();
  if (vehicles.length === 0) {
    const sampleVehicles = [
      {
        make: 'Tesla',
        model: 'Model S Plaid',
        category: 'Electric',
        price: 89990,
        quantity: 4,
      },
      {
        make: 'Porsche',
        model: '911 Carrera S',
        category: 'Coupe',
        price: 131300,
        quantity: 2,
      },
      {
        make: 'BMW',
        model: 'M4 Competition',
        category: 'Coupe',
        price: 79100,
        quantity: 3,
      },
      {
        make: 'Mercedes-Benz',
        model: 'G 63 AMG',
        category: 'SUV',
        price: 179000,
        quantity: 1,
      },
      {
        make: 'Audi',
        model: 'RS6 Avant',
        category: 'Wagon',
        price: 125800,
        quantity: 3,
      },
      {
        make: 'Ford',
        model: 'F-150 Lightning',
        category: 'Truck',
        price: 54995,
        quantity: 5,
      },
      {
        make: 'Toyota',
        model: 'GR Supra 3.0',
        category: 'Coupe',
        price: 56250,
        quantity: 6,
      },
      {
        make: 'Land Rover',
        model: 'Defender 110',
        category: 'SUV',
        price: 68400,
        quantity: 4,
      },
      {
        make: 'Chevrolet',
        model: 'Corvette Z06',
        category: 'Coupe',
        price: 112700,
        quantity: 0, // Deliberately out of stock to demonstrate UI disable state
      },
      {
        make: 'Honda',
        model: 'Civic Type R',
        category: 'Hatchback',
        price: 44795,
        quantity: 2,
      },
    ];

    const now = new Date().toISOString();
    for (const v of sampleVehicles) {
      vehicleRepo.create({
        id: uuidv4(),
        make: v.make,
        model: v.model,
        category: v.category,
        price: v.price,
        quantity: v.quantity,
        created_at: now,
        updated_at: now,
      });
    }
    console.log(`Seeded ${sampleVehicles.length} initial vehicles into dealership inventory.`);
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Database seeding complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}
