'use client';

import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  MapPin,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  InspectionFormSchema,
  type InspectionFormData,
  QUESTION_LABELS,
} from '@/lib/inspection-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ImageUpload } from '@/components/inspection/image-upload';
import { getCurrentLocation } from '@/lib/utils';
import {
  Section3,
  Section4,
  Section5,
  Section6,
  Section7,
  Section8,
  Section9,
} from '@/components/inspection/form-sections';

const SECTION_TITLES = [
  'Planejamento e Integração',
  'Permissão de Trabalho',
  'Máquinas e Equipamentos Manuais',
  'Movimentação de Cargas',
  'Equipamentos de Proteção Individual (EPI)',
  'Sinalização',
  'Escavações',
  'Parecer Final',
  'Registro Fotográfico',
];

interface InspectionFormProps {
  inspectionId?: string;
  initialData?: Partial<InspectionFormData>;
  mode?: 'create' | 'edit';
}

export function InspectionForm({
  inspectionId,
  initialData,
  mode = 'create',
}: InspectionFormProps) {
  const router = useRouter();
  const [currentSection, setCurrentSection] = React.useState(0);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [locationLoading, setLocationLoading] = React.useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InspectionFormData>({
    resolver: zodResolver(InspectionFormSchema),
    defaultValues: initialData || {
      title: '',
      location: undefined,
      section1: {},
      section2: {},
      section3: {},
      section4: {},
      section5: {},
      section6: {},
      section7: {},
      section8: {},
      section9: { fotos_gerais: [] },
    },
  });

  // Capturar localização
  const handleGetLocation = async () => {
    setLocationLoading(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        setValue('location', location);
      }
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      alert('Erro ao obter localização. Verifique as permissões do navegador.');
    } finally {
      setLocationLoading(false);
    }
  };

  // Auto-save a cada 30 segundos
  React.useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const formData = watch();
        await saveDraft(formData);
      } catch (error) {
        // Silenciar erros de auto-save (será mostrado no save manual)
        console.error('Auto-save falhou:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [watch]);

  const saveDraft = async (data: Partial<InspectionFormData>) => {
    try {
      const response = await fetch(
        inspectionId ? `/api/inspections/${inspectionId}` : '/api/inspections',
        {
          // Usar PUT para salvar tudo, POST para criar novo
          method: inspectionId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, status: 'DRAFT' }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Falha ao salvar rascunho');
      }

      const result = await response.json();
      
      // Se criou nova inspeção, atualizar o ID
      if (!inspectionId && result.id) {
        window.history.replaceState(
          null,
          '',
          `/inspection/${result.id}/edit`
        );
      }

      return result;
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
      // Re-lançar erro para ser tratado pelo caller
      throw error;
    }
  };

  const onSaveDraft = async () => {
    setIsSaving(true);
    try {
      // Pegar dados atuais do formulário SEM validação
      const formData = watch();
      console.log('💾 Salvando rascunho:', {
        inspectionId,
        mode,
        hasTitle: !!formData.title,
        hasLocation: !!formData.location,
        sections: Object.keys(formData).filter(k => k.startsWith('section'))
      });
      
      const result = await saveDraft(formData);
      console.log('✅ Rascunho salvo com sucesso:', result);
      alert('Rascunho salvo com sucesso!');
      router.push('/dashboard');
    } catch (error) {
      console.error('❌ Erro ao salvar rascunho:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erro ao salvar rascunho';
      alert(`Erro ao salvar: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = async (data: InspectionFormData) => {
    setIsSubmitting(true);
    try {
      const url = mode === 'edit' && inspectionId
        ? `/api/inspections/${inspectionId}`
        : '/api/inspections';
      
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, status: 'SUBMITTED' }),
      });

      if (!response.ok) throw new Error('Falha ao enviar inspeção');

      const result = await response.json();
      alert(mode === 'edit' ? 'Inspeção atualizada com sucesso!' : 'Inspeção enviada com sucesso!');
      router.push(`/inspection/${result.id}`);
    } catch (error) {
      console.error('Erro ao enviar inspeção:', error);
      alert('Erro ao enviar inspeção');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextSection = () => {
    if (currentSection < SECTION_TITLES.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderResponseField = (name: any, label: string, required = true) => (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <RadioGroup
            onValueChange={field.onChange}
            value={field.value}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="YES" id={`${name}-yes`} />
              <Label htmlFor={`${name}-yes`} className="font-normal">
                Sim
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="NO" id={`${name}-no`} />
              <Label htmlFor={`${name}-no`} className="font-normal">
                Não
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="NA" id={`${name}-na`} />
              <Label htmlFor={`${name}-na`} className="font-normal">
                N/A
              </Label>
            </div>
          </RadioGroup>
        )}
      />
      {errors && (
        <p className="text-sm text-red-500">
          {(errors as any)[name]?.message}
        </p>
      )}
    </div>
  );

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {mode === 'create' ? 'Nova Inspeção' : 'Editar Inspeção'}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <span>
              Seção {currentSection + 1} de {SECTION_TITLES.length}:
            </span>
            <span className="font-medium">{SECTION_TITLES[currentSection]}</span>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Seção 0: Informações Gerais */}
            {currentSection === 0 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título (opcional)</Label>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="title"
                        placeholder="Ex: Inspeção na Rua das Flores"
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Localização</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGetLocation}
                    disabled={locationLoading}
                    className="w-full"
                  >
                    {locationLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Obtendo localização...
                      </>
                    ) : (
                      <>
                        <MapPin className="mr-2 h-4 w-4" />
                        Capturar Localização GPS
                      </>
                    )}
                  </Button>
                  {watch('location') && (
                    <p className="text-sm text-green-600">
                      ✓ Localização capturada: {watch('location')?.address}
                    </p>
                  )}
                </div>

                <Separator />

                <h3 className="font-semibold text-lg">
                  Seção 1: {SECTION_TITLES[0]}
                </h3>

                {renderResponseField(
                  'section1.q1_equipe_integrada',
                  QUESTION_LABELS.q1_equipe_integrada
                )}
                {renderResponseField(
                  'section1.q2_cracha_visivel',
                  QUESTION_LABELS.q2_cracha_visivel
                )}
                {renderResponseField(
                  'section1.q3_lider_presente',
                  QUESTION_LABELS.q3_lider_presente
                )}
                {renderResponseField(
                  'section1.q4_pdst_elaborado',
                  QUESTION_LABELS.q4_pdst_elaborado
                )}
                {renderResponseField(
                  'section1.q5_pdst_passos_adequados',
                  QUESTION_LABELS.q5_pdst_passos_adequados
                )}
                {renderResponseField(
                  'section1.q6_riscos_condizentes',
                  QUESTION_LABELS.q6_riscos_condizentes
                )}
                {renderResponseField(
                  'section1.q7_barreiras_controle',
                  QUESTION_LABELS.q7_barreiras_controle
                )}
                {renderResponseField(
                  'section1.q8_pdst_assinado',
                  QUESTION_LABELS.q8_pdst_assinado
                )}
                {renderResponseField(
                  'section1.q9_lider_identificado',
                  QUESTION_LABELS.q9_lider_identificado
                )}
                {renderResponseField(
                  'section1.q10_reuniao_pretrab',
                  QUESTION_LABELS.q10_reuniao_pretrab
                )}

                <Controller
                  name="section1.q11_foto_pdst"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value || []}
                      onChange={field.onChange}
                      required
                      label="Foto do PDST"
                      helpText="Obrigatório: Enviar foto do PDST assinado (sem limite de imagens)"
                    />
                  )}
                />
              </div>
            )}

            {/* Seção 2: Permissão de Trabalho */}
            {currentSection === 1 && (
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">
                  Seção 2: {SECTION_TITLES[1]}
                </h3>

                {renderResponseField(
                  'section2.q11_pt_emitida',
                  QUESTION_LABELS.q11_pt_emitida
                )}
                {renderResponseField(
                  'section2.q12_emitente_treinado',
                  QUESTION_LABELS.q12_emitente_treinado
                )}

                <Controller
                  name="section2.q13_foto_pt"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value || []}
                      onChange={field.onChange}
                      label="Foto da PT (opcional)"
                      helpText="Se aplicável, enviar foto da Permissão de Trabalho (sem limite de imagens)"
                    />
                  )}
                />
              </div>
            )}

            {/* Seção 3: Máquinas e Equipamentos Manuais */}
            {currentSection === 2 && (
              <Section3 control={control} errors={errors} watch={watch} />
            )}

            {/* Seção 4: Movimentação de Cargas */}
            {currentSection === 3 && (
              <Section4 control={control} errors={errors} watch={watch} />
            )}

            {/* Seção 5: EPIs */}
            {currentSection === 4 && (
              <Section5 control={control} errors={errors} watch={watch} />
            )}

            {/* Seção 6: Sinalização */}
            {currentSection === 5 && (
              <Section6 control={control} errors={errors} watch={watch} />
            )}

            {/* Seção 7: Escavações */}
            {currentSection === 6 && (
              <Section7 control={control} errors={errors} watch={watch} />
            )}

            {/* Seção 8: Parecer Final */}
            {currentSection === 7 && (
              <Section8 control={control} errors={errors} watch={watch} />
            )}

            {/* Seção 9: Registro Fotográfico */}
            {currentSection === 8 && (
              <Section9 control={control} errors={errors} watch={watch} />
            )}

            {/* Navegação - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 mt-8 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevSection}
                disabled={currentSection === 0}
                className="w-full sm:w-auto btn-mobile"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onSaveDraft}
                  disabled={isSaving}
                  className="w-full sm:w-auto btn-mobile"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Rascunho
                    </>
                  )}
                </Button>

                {currentSection === SECTION_TITLES.length - 1 ? (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full sm:w-auto btn-mobile"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Inspeção
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={nextSection}
                    className="w-full sm:w-auto btn-mobile"
                  >
                    Próxima
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Indicador de progresso */}
      <div className="mt-6 flex gap-1 justify-center">
        {SECTION_TITLES.map((title, index) => {
          let progressColor = 'bg-gray-200';
          if (index === currentSection) {
            progressColor = 'bg-blue-600';
          } else if (index < currentSection) {
            progressColor = 'bg-green-500';
          }

          return (
            <div
              key={`section-${index}-${title}`}
              className={`h-2 w-8 rounded-full transition-colors ${progressColor}`}
            />
          );
        })}
      </div>
    </div>
  );
}
