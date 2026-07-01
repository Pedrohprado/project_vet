import { migrationContent } from '@/lib/landing-content';
import { MigrationBoxScene } from './migration-box-scene';
import { LandingSection } from './landing-section';

export function LandingMigration() {
  return (
    <LandingSection
      id="migracao"
      title={migrationContent.title}
      subtitle={migrationContent.subtitle}
    >
      <MigrationBoxScene badges={migrationContent.badges} />
    </LandingSection>
  );
}
