import 'dotenv/config';
import { DataSource } from 'typeorm';
import { typeOrmConfig } from '../database/typeorm.config';
import { User } from '../modules/users/user.entity';
import { seedAdmin } from './admin.seed';

async function main() {
  const config = typeOrmConfig() as any;
  const dataSource = new DataSource({
    ...config,
    entities: [User],
  });

  await dataSource.initialize();
  console.log('Connected to database');

  const userRepo = dataSource.getRepository(User);
  await seedAdmin(userRepo);
  
  console.log('Admin seed completed');
  await dataSource.destroy();
}

main().catch(console.error);