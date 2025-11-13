'use client';

import React from 'react';
import {
  Controller,
  get,
  type Control,
  type FieldError,
  type FieldErrors,
  type Path,
  type UseFormWatch,
} from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ImageUpload } from '@/components/inspection/image-upload';
import { Separator } from '@/components/ui/separator';
import type { InspectionFormData } from '@/lib/inspection-schema';

interface FormSectionProps {
  control: Control<InspectionFormData>;
  errors: FieldErrors<InspectionFormData>;
  watch: UseFormWatch<InspectionFormData>;
}

// Helper para renderizar campo de resposta YES/NO/NA
export const ResponseField = ({
  name,
  label,
  required = true,
  control,
  errors,
}: {
  name: Path<InspectionFormData>;
  label: string;
  required?: boolean;
  control: Control<InspectionFormData>;
  errors: FieldErrors<InspectionFormData>;
}) => {
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
              <Label htmlFor={`${name}-yes`} className="font-normal cursor-pointer">
                Sim
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="NO" id={`${name}-no`} />
              <Label htmlFor={`${name}-no`} className="font-normal cursor-pointer">
                Não
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="NA" id={`${name}-na`} />
              <Label htmlFor={`${name}-na`} className="font-normal cursor-pointer">
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

// Seção 3: Máquinas e Equipamentos Manuais
export const Section3 = ({ control, errors, watch }: FormSectionProps) => {
  const usaEquipamentos = watch('section3.q14_usa_equipamentos');

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">
        Seção 3: Máquinas e Equipamentos Manuais
      </h3>

      <ResponseField
        name="section3.q14_usa_equipamentos"
        label="14. A equipe utiliza equipamentos manuais (serra cliper; policorte; compactador)?"
        control={control}
        errors={errors}
      />

      {usaEquipamentos === 'YES' && (
        <div className="pl-6 space-y-6 border-l-2 border-blue-200">
            <div className="space-y-2">
              <Label htmlFor="equipamentos-lista">
                Listar equipamentos utilizados:
              </Label>
              <Controller
                name="section3.q14_equipamentos_lista"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="equipamentos-lista"
                    placeholder="Ex: Serra cliper, policorte..."
                    rows={3}
                  />
                )}
              />
            </div>

            <ResponseField
              name="section3.q14_1_inspecionados"
              label="14.1. Os equipamentos foram inspecionados e liberadas pela área de Segurança do Trabalho?"
              control={control}
              errors={errors}
            />

            <ResponseField
              name="section3.q14_2_operador_treinado"
              label="14.2. O operador do equipamento possui treinamento específico e dentro do prazo de validade?"
              control={control}
              errors={errors}
            />

            <ResponseField
              name="section3.q14_4_checklist_preuso"
              label="14.4. Foi aplicado checklist de pré-uso do equipamento?"
              control={control}
              errors={errors}
            />

            <ResponseField
              name="section3.q14_5_combustivel_certificado"
              label="14.5. O combustível utilizado é transportado em containers certificados pelo INMETRO?"
              control={control}
              errors={errors}
            />

            <ResponseField
              name="section3.q14_6_fds_disponivel"
              label="14.6. A Ficha de Dados de Segurança (FDS) do produto químico está disponível na frente de serviço?"
              control={control}
              errors={errors}
            />

            <ResponseField
              name="section3.q14_7_transporte_seguro"
              label="14.7. Os equipamentos são transportados em local seguro e bem amarrado, sem risco de queda?"
              control={control}
              errors={errors}
            />
          </div>
      )}
    </div>
  );
};

// Seção 4: Movimentação de Cargas
export const Section4 = ({ control, errors, watch }: FormSectionProps) => {
  const usaMaquinas = watch('section4.q15_usa_maquinas');

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">Seção 4: Movimentação de Cargas</h3>

      <ResponseField
        name="section4.q15_usa_maquinas"
        label="15. A equipe utiliza máquinas para movimentação de materiais (retroescavadeira; munck)?"
        control={control}
        errors={errors}
      />

      {usaMaquinas === 'YES' && (
        <div className="pl-6 space-y-6 border-l-2 border-blue-200">
            <div className="space-y-2">
              <Label htmlFor="maquinas-lista">Listar máquinas utilizadas:</Label>
              <Controller
                name="section4.q15_maquinas_lista"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="maquinas-lista"
                    placeholder="Ex: Retroescavadeira, munck..."
                    rows={3}
                  />
                )}
              />
            </div>

            <ResponseField
              name="section4.q15_1_maquina_inspecionada"
              label="15.1. A máquina foi inspecionada e liberada pela área de Segurança do Trabalho?"
              control={control}
              errors={errors}
            />

            <ResponseField
              name="section4.q15_2_operador_treinado"
              label="15.2. O operador de máquina possui treinamento específico e dentro do prazo de validade?"
              control={control}
              errors={errors}
            />

            <ResponseField
              name="section4.q15_3_operador_cracha"
              label="15.3. O operador de máquina possui crachá de identificação constando a data de validade do ASO válido?"
              control={control}
              errors={errors}
            />

            <ResponseField
              name="section4.q15_4_checklist_maquina"
              label="15.4. Foi aplicado checklist de pré-uso da máquina?"
              control={control}
              errors={errors}
            />

            <ResponseField
              name="section4.q15_5_area_isolada"
              label="15.5. A área de movimentação de carga está isolada e livre do acesso de pessoas?"
              control={control}
              errors={errors}
            />

            <ResponseField
              name="section4.q15_6_acessorios_inspecionados"
              label="15.6. Acessórios de içamento foram inspecionados (FR.049)?"
              control={control}
              errors={errors}
            />

            <ResponseField
              name="section4.q15_7_cargas_guiadas"
              label="15.7. Cargas estão sendo guiadas com cordas/cabos (sem uso das mãos)?"
              control={control}
              errors={errors}
            />
          </div>
      )}

      <Separator />

      <ResponseField
        name="section4.q16_cunhas_disponiveis"
        label="16. Cunhas separadoras disponíveis para materiais com risco de prensamento?"
        control={control}
        errors={errors}
      />

      <ResponseField
        name="section4.q17_caminhoes_calcos"
        label="17. Caminhões/veículos pesados possuem 4 calços em uso?"
        control={control}
        errors={errors}
      />
    </div>
  );
};

// Seção 5: EPIs
export const Section5 = ({ control, errors }: FormSectionProps) => {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">
        Seção 5: Equipamentos de Proteção Individual (EPI)
      </h3>

      <ResponseField
        name="section5.q18_uso_epi"
        label="18. Funcionário faz uso de todos os EPI, conforme risco da atividade?"
        control={control}
        errors={errors}
      />

      <ResponseField
        name="section5.q19_epi_adequado"
        label="19. EPIs adequados ao risco, em bom estado de conservação?"
        control={control}
        errors={errors}
      />

      <ResponseField
        name="section5.q20_bolsa_epi"
        label="20. O funcionário possui bolsa ou local adequado para transporte de EPI?"
        control={control}
        errors={errors}
      />

      <ResponseField
        name="section5.q21_lanterna_noturna"
        label="21. Funcionário possui lanterna de cabeça para atividades noturnas?"
        control={control}
        errors={errors}
      />
    </div>
  );
};

// Seção 6: Sinalização
export const Section6 = ({ control, errors }: FormSectionProps) => {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">Seção 6: Sinalização</h3>

      <ResponseField
        name="section6.q22_local_sinalizado"
        label="22. O local está bem sinalizado com Placas, cones, fitas zebradas etc., conforme PR.004.COR.TCR?"
        control={control}
        errors={errors}
      />

      <ResponseField
        name="section6.q23_veiculos_barreira"
        label="23. Veículos barreira posicionados corretamente?"
        control={control}
        errors={errors}
      />

      <ResponseField
        name="section6.q24_dispositivos_luminosos"
        label="24. Para atividades noturnas: dispositivos luminosos instalados?"
        control={control}
        errors={errors}
      />
    </div>
  );
};

// Seção 7: Escavações
export const Section7 = ({ control, errors, watch }: FormSectionProps) => {
  const escavacaoProfunda = watch('section7.q25_escavacao_profunda');

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">Seção 7: Escavações</h3>

      <ResponseField
        name="section7.q25_escavacao_profunda"
        label="25. A escavação >1,25m de profundidade?"
        control={control}
        errors={errors}
      />

      {escavacaoProfunda === 'YES' && (
        <div className="pl-6 space-y-6 border-l-2 border-blue-200">
          <ResponseField
            name="section7.q25_1_escoramento"
            label="25.1. Escoramento ou rampa de 45°?"
            control={control}
            errors={errors}
          />

          <ResponseField
            name="section7.q25_2_escadas_acesso"
            label="25.2. Escadas ou rampas de acesso?"
            control={control}
            errors={errors}
          />
        </div>
      )}

      <ResponseField
        name="section7.q26_materiais_distantes"
        label="26. Materiais distantes ≥1m das bordas?"
        control={control}
        errors={errors}
      />
    </div>
  );
};

// Seção 8: Parecer Final
export const Section8 = ({ control, errors, watch }: FormSectionProps) => {
  const realizouFortalecer = watch('section8.q28_fortalecer_realizado');
  const indicacaoFortalecer = watch('section8.q29_indicacao_fortalecer');
  const ncPendentes = watch('section8.q31_nc_pendentes');

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">Seção 8: Parecer Final</h3>

      <div className="space-y-2">
        <Label>
          27. Equipe consciente dos riscos e atendendo às diretrizes de segurança?{' '}
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <Controller
          name="section8.q27_equipe_consciente"
          control={control}
          render={({ field }) => (
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="YES" id="q27-yes" />
                <Label htmlFor="q27-yes" className="font-normal cursor-pointer">
                  Sim
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NO" id="q27-no" />
                <Label htmlFor="q27-no" className="font-normal cursor-pointer">
                  Não
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PARTIAL" id="q27-partial" />
                <Label htmlFor="q27-partial" className="font-normal cursor-pointer">
                  Parcialmente
                </Label>
              </div>
            </RadioGroup>
          )}
        />
      </div>

      <ResponseField
        name="section8.q28_fortalecer_realizado"
        label="28. Foi realizado o FORTALECER com a equipe em campo?"
        control={control}
        errors={errors}
      />

      {realizouFortalecer === 'YES' && (
        <div className="pl-6 space-y-2 border-l-2 border-blue-200">
          <Label htmlFor="temas-fortalecer">Quais temas foram abordados?</Label>
          <Controller
            name="section8.q28_temas"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                id="temas-fortalecer"
                placeholder="Descreva os temas abordados..."
                rows={3}
              />
            )}
          />
        </div>
      )}

      <ResponseField
        name="section8.q29_indicacao_fortalecer"
        label="29. Indicação de funcionários para participação no FORTALECER em sala?"
        control={control}
        errors={errors}
      />

      {indicacaoFortalecer === 'YES' && (
        <div className="pl-6 space-y-2 border-l-2 border-blue-200">
          <Label htmlFor="nomes-fortalecer">
            Nomes dos funcionários indicados:
          </Label>
          <Controller
            name="section8.q29_nomes"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                id="nomes-fortalecer"
                placeholder="Liste os nomes..."
                rows={3}
              />
            )}
          />
        </div>
      )}

      <ResponseField
        name="section8.q30_paralisacao"
        label="30. Houve necessidade de paralização da atividade?"
        control={control}
        errors={errors}
      />

      <ResponseField
        name="section8.q31_nc_pendentes"
        label="31. Ficou não conformidades pendentes de correção?"
        control={control}
        errors={errors}
      />

      {ncPendentes === 'YES' && (
        <div className="pl-6 space-y-2 border-l-2 border-red-200">
          <Label htmlFor="descricao-nc" className="text-red-700">
            Descreva as não conformidades pendentes:{' '}
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Controller
            name="section8.q31_descricao_nc"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                id="descricao-nc"
                placeholder="Descreva detalhadamente as não conformidades..."
                rows={4}
                className="border-red-300"
              />
            )}
          />
        </div>
      )}
    </div>
  );
};

// Seção 9: Registro Fotográfico
export const Section9 = ({ control, errors }: FormSectionProps) => {
  return (
    <div className="space-y-6 pb-8">
      <h3 className="font-semibold text-lg">Seção 9: Registro Fotográfico</h3>

      <p className="text-sm text-muted-foreground">
        Anexe fotos gerais da frente de serviço, equipe, sinalização, equipamentos
        e demais evidências relevantes.
      </p>

      <Controller
        name="section9.fotos_gerais"
        control={control}
        render={({ field }) => (
          <ImageUpload
            value={field.value || []}
            onChange={field.onChange}
            maxImages={20}
            required
            label="Fotos Gerais"
            helpText="Mínimo 1 foto obrigatória. Máximo 20 fotos."
          />
        )}
      />

      {errors.section9?.fotos_gerais && (
        <p className="text-sm text-red-500">
          {errors.section9.fotos_gerais.message}
        </p>
      )}
      
      {/* Espaçamento extra para garantir visibilidade dos botões */}
      <div className="h-4" />
    </div>
  );
};
