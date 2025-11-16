'use client';

import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  MapPin,
  Loader2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  useForm,
  Controller,
  get,
  type FieldError,
  type Path,
} from 'react-hook-form';
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
  readonly inspectionId?: string;
  readonly initialData?: Partial<InspectionFormData>;
  readonly mode?: 'create' | 'edit';
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
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [answeredQuestions, setAnsweredQuestions] = React.useState(0);
  const autoSaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
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

  // Carregar valores iniciais em modo edição
  React.useEffect(() => {
    if (initialData && mode === 'edit') {
      reset(initialData);
      setHasUnsavedChanges(false);
    }
  }, [initialData, mode, reset]);

  // Contar questões respondidas
  React.useEffect(() => {
    const subscription = watch((formData) => {
      let count = 0;
      
      // Contar todas as questões que têm resposta (YES, NO ou NA)
      const allSections = [formData.section1, formData.section2, formData.section3, 
                          formData.section4, formData.section5, formData.section6,
                          formData.section7, formData.section8];
      
      allSections.forEach(section => {
        if (section) {
          Object.values(section).forEach(value => {
            if (value === 'YES' || value === 'NO' || value === 'NA') {
              count++;
            }
          });
        }
      });
      
      setAnsweredQuestions(count);
      setHasUnsavedChanges(isDirty);
    });
    
    return () => subscription.unsubscribe();
  }, [watch, isDirty]);

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

  const saveDraft = React.useCallback(async (data: Partial<InspectionFormData>, isAutoSave = false) => {
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
        globalThis.history.replaceState(
          null,
          '',
          `/inspection/${result.id}/edit`
        );
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      if (!isAutoSave) {
        toast.success('Rascunho salvo com sucesso!', {
          description: `${answeredQuestions} questões respondidas`,
          icon: <CheckCircle2 className="h-4 w-4" />,
        });
      }

      return result;
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
      if (!isAutoSave) {
        toast.error('Erro ao salvar rascunho', {
          description: error instanceof Error ? error.message : 'Tente novamente',
        });
      }
      throw error;
    }
  }, [inspectionId, answeredQuestions]);

  // Auto-save com debounce (30 segundos após última mudança)
  React.useEffect(() => {
    if (!hasUnsavedChanges) return;
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      setIsAutoSaving(true);
      try {
        const formData = watch();
        await saveDraft(formData, true);
      } catch (error) {
        console.error('Auto-save falhou:', error);
      } finally {
        setIsAutoSaving(false);
      }
    }, 30000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, watch, saveDraft]);

  // Confirmação ao sair com mudanças não salvas
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const onSaveDraft = async () => {
    setIsSaving(true);
    try {
      const formData = watch();
      await saveDraft(formData, false);
      router.push('/dashboard');
    } catch (error) {
      console.error('❌ Erro ao salvar rascunho:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = async (data: InspectionFormData) => {
    // Verificar erros de validação
    if (Object.keys(errors).length > 0) {
      const errorCount = Object.keys(errors).length;
      toast.error(`${errorCount} campo(s) obrigatório(s) não preenchido(s)`, {
        description: 'Role para baixo para ver os erros destacados',
        duration: 5000,
      });
      
      // Scroll para o primeiro erro
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Falha ao enviar inspeção');
      }

      const result = await response.json();
      
      setHasUnsavedChanges(false);
      
      toast.success(
        mode === 'edit' ? 'Inspeção atualizada!' : 'Inspeção enviada!',
        {
          description: 'Redirecionando para visualização...',
          icon: <CheckCircle2 className="h-4 w-4" />,
        }
      );
      
      setTimeout(() => router.push(`/inspection/${result.id}`), 500);
    } catch (error) {
      console.error('Erro ao enviar inspeção:', error);
      toast.error('Erro ao enviar inspeção', {
        description: error instanceof Error ? error.message : 'Verifique os campos obrigatórios',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextSection = () => {
    if (currentSection < SECTION_TITLES.length - 1) {
      setCurrentSection(currentSection + 1);
      globalThis.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      globalThis.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderResponseField = (
    name: Path<InspectionFormData>,
    label: string,
    required = true
  ) => {
    const fieldError = get(errors, name) as FieldError | undefined;

    return (
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
              value={typeof field.value === 'string' ? field.value : ''}
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
        {fieldError?.message && (
          <p className="text-sm text-red-500">{fieldError.message}</p>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">
                {mode === 'create' ? 'Nova Inspeção' : 'Editar Inspeção'}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <span>
                  Seção {currentSection + 1} de {SECTION_TITLES.length}:
                </span>
                <span className="font-medium">{SECTION_TITLES[currentSection]}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 text-sm">
              {/* Progress Counter */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="font-medium">{answeredQuestions}</span>
                <span>questões respondidas</span>
              </div>
              
              {/* Auto-save Indicator */}
              {(() => {
                if (isAutoSaving) {
                  return (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs">Salvando...</span>
                    </div>
                  );
                }
                
                if (lastSaved) {
                  const timeDiff = Date.now() - lastSaved.getTime();
                  const minutesAgo = Math.floor(timeDiff / 60000);
                  const savedText = timeDiff < 60000 ? 'agora' : `há ${minutesAgo}min`;
                  
                  return (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">Salvo {savedText}</span>
                    </div>
                  );
                }
                
                if (hasUnsavedChanges) {
                  return (
                    <div className="flex items-center gap-2 text-orange-600">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">Não salvo</span>
                    </div>
                  );
                }
                
                return null;
              })()}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Alerta de Erros de Validação */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-red-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    {Object.keys(errors).length} campo(s) obrigatório(s) não preenchido(s)
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    Preencha todos os campos obrigatórios (marcados com *) antes de enviar a inspeção.
                  </p>
                </div>
              </div>
            </div>
          )}

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
