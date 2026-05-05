import { GlobalSetting } from '../modules/config/global-setting.entity';

export async function seedGlobalSettings(repo: any) {
  const settings = [
    { key: 'registration_lock_duration', value: '30', description: 'Registration lock duration in minutes' },
  ];

  for (const s of settings) {
    const existing = await repo.findOne({ where: { key: s.key } });
    if (!existing) {
      await repo.save(repo.create(s));
      console.log(`Created setting: ${s.key}`);
    } else {
      console.log(`Setting already exists: ${s.key}`);
    }
  }
}
