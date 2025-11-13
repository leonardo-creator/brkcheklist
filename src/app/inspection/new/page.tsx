import { requireApprovedUser } from '@/lib/auth-utils';
import { InspectionForm } from '@/components/inspection/inspection-form';

export default async function NewInspectionPage() {
  // Garantir que o usuário está autenticado e aprovado
  await requireApprovedUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <InspectionForm mode="create" />
    </div>
  );
}
