import * as bcrypt from 'bcrypt';
import { User } from '../modules/users/user.entity';
import { Role } from '../common/enums/role.enum';

export async function seedAdmin(repo : any) {
  const admin = await repo.findOne({ where: { email: 'admin@mail.com' } });

  if (!admin) {
    const hash = await bcrypt.hash('admin123', 10);

    await repo.save({
      name: 'Admin',
      email: 'admin@mail.com',
      password: hash,
      role: Role.ADMIN,
    });
  }
}