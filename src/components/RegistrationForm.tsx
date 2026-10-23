import React, { useState, useEffect } from 'react';
import { 
  EscoteiroCadastro, 
  calcularIdade, 
  identificarRamo, 
  formatarCPF, 
  formatarTelefone, 
  formatarCEP,
  TipoSanguineo,
  ContatoEmergencia
} from '../types/scout';
import { 
  User, 
  Users, 
  HeartPulse, 
  FileCheck, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Sparkles, 
  Plus, 
  Trash2, 
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Camera,
  Upload,
  Smartphone,
  Video,
  RefreshCw,
  X
} from 'lucide-react';

interface RegistrationFormProps {
  initialData?: EscoteiroCadastro | null;
  onSave: (dados: EscoteiroCadastro) => void;
  onCancel: () => void;
  onPrint?: (dados: EscoteiroCadastro) => void;
}

const DOENCAS_LISTA = [
  'Asma', 'Bronquite', 'Catapora', 'Caxumba', 'Convulsões', 'Desmaios', 'Dengue',
  'Diabetes', 'Epilepsia', 'Hemofilia', 'Hepatite', 'Rubéola', 'Sarampo', 'Sinusite'
];

const EQUIPAMENTOS_LISTA = [
  'Óculos', 'Lentes de contato', 'Aparelho dentário', 'Sonda', 'Marca-passo', 'Aparelho auditivo'
];

const CONDICOES_NEURO_LISTA = [
  'Dislexia', 'Disgrafia', 'Discalculia', 'TOD (Transtorno Opositor Desafiador)', 'TEA associado a comorbidades'
];

const TIPOS_DEFICIENCIA_LISTA = ['Física', 'Visual', 'Auditiva', 'Intelectual'];

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  initialData,
  onSave,
  onCancel,
  onPrint,
}) => {
  const [etapa, setEtapa] = useState<number>(1);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Estados para foto 3x4
  const [processandoFoto, setProcessandoFoto] = useState<boolean>(false);
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const [modalWebcamAberta, setModalWebcamAberta] = useState<boolean>(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Form State
  const [form, setForm] = useState<EscoteiroCadastro>(() => {
    if (initialData) return initialData;

    return {
      id: '',
      criadoEm: '',
      atualizadoEm: '',
      foto: '',
      nomeCompleto: '',
      sexo: 'M',
      dataNascimento: '',
      naturalidade: 'Franca',
      ufNaturalidade: 'SP',
      estadoCivil: 'Solteiro(a)',
      rg: '',
      cpf: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: 'Franca',
      uf: 'SP',
      cep: '',
      telefone1: '',
      telefone2: '',
      email: '',
      profissao: 'Estudante',
      escolaridade: 'Ensino Fundamental',
      religiao: '',
      primeiroResponsavel: {
        nomeCompleto: '',
        sexo: '',
        dataNascimento: '',
        estadoCivil: '',
        rg: '',
        cpf: '',
        grauParentesco: 'Mãe',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: 'Franca',
        uf: 'SP',
        cep: '',
        telefone1: '',
        telefone2: '',
        email: '',
        profissao: '',
        escolaridade: ''
      },
      temSegundoResponsavel: false,
      segundoResponsavel: {
        nomeCompleto: '',
        sexo: '',
        dataNascimento: '',
        estadoCivil: '',
        rg: '',
        cpf: '',
        grauParentesco: 'Pai',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: 'Franca',
        uf: 'SP',
        cep: '',
        telefone1: '',
        telefone2: '',
        email: '',
        profissao: '',
        escolaridade: ''
      },
      responsavelGuarda: 'Ambos / Compartilhada',
      responsavelGuardaOutro: '',
      outroResponsavelCiencia: true,
      outroResponsavelConcorda: true,
      regimeConvivenciaVisitas: 'Residência conjunta com a família',
      contatosEmergencia: [
        { id: '1', nome: '', parentesco: '', telefone: '' }
      ],
      fichaMedica: {
        numeroRegistro: '',
        altura: '',
        peso: '',
        tipoSanguineo: 'O+',
        fatorRh: 'Positivo',
        equipamentosAuxilio: [],
        equipamentosAuxilioOutros: '',
        doencasPregressas: [],
        condicoesTratamento: '',
        outrasInformacoesClinicas: '',
        apresentaNeurodivergencia: false,
        autismoTea: false,
        autismoNivelSuporte: '',
        autismoGatilhos: '',
        tdah: false,
        tdahPredominio: '',
        tdahObservacoes: '',
        outrasCondicoesNeuro: [],
        outraCondicaoNaoListada: '',
        cuidadosPedagogicos: '',
        medicacoesQuadroNeuro: '',
        medicamentoContinuo: false,
        medicamentosDetalhes: '',
        autorizaAdministracaoMedicamentos: true,
        restricoesMedicamentos: '',
        urgenciaEmergenciaMedica: 'Autoriza intervenção médica imediata',
        avisarPrioritariamente: 'Pais/Responsáveis legais',
        avisarPrioritariamenteOutro: '',
        avisarPrioritariamenteTelefone: '',
        possuiPlanoSaude: true,
        planoOperadora: 'Unimed Franca',
        planoNumeroCarteirinha: '',
        planoMedicoReferencia: '',
        planoTelefoneMedico: '',
        apresentaAlergia: false,
        alergiaPicadaInsetos: false,
        alergiaPicadaInsetosDetalhes: '',
        alergiaMedicamentos: false,
        alergiaMedicamentosDetalhes: '',
        alergiaPlantasPolen: false,
        alergiaPlantasPolenDetalhes: '',
        alergiaAlimentos: false,
        alergiaAlimentosDetalhes: '',
        alergiaOutras: false,
        alergiaOutrasDetalhes: '',
        impedidoAtividadesArLivre: false,
        impedidoAtividadesDetalhes: '',
        restricoesAlimentares: false,
        restricoesAlimentaresDetalhes: '',
        cardiopatias: false,
        cardiopatiasDetalhes: '',
        sabeNadar: true,
        historicoSonambulismo: false,
        transtornoComportamento: false,
        transtornoComportamentoDetalhes: '',
        transtornoAlimentar: false,
        transtornoAlimentarDetalhes: '',
        transtornoAnsiedadeFobia: false,
        transtornoAnsiedadeFobiaDetalhes: '',
        apresentaDeficiencia: false,
        tiposDeficiencia: [],
        deficienciaEspecificar: ''
      },
      autorizacaoImagem: true,
      concordanciaRegulamento: true,
      cienciaContribuicaoMensal: true,
      responsavelAssinatura: '',
      cpfAssinatura: '',
      dataAssinatura: new Date().toISOString().split('T')[0],
      cidadeAssinatura: 'Franca/SP'
    };
  });

  // Calculate live age & branch
  const idadeAtual = calcularIdade(form.dataNascimento);
  const ramoAtual = identificarRamo(idadeAtual);

  // Sync responsible signature if empty
  useEffect(() => {
    if (!form.responsavelAssinatura && form.primeiroResponsavel.nomeCompleto) {
      setForm(prev => ({
        ...prev,
        responsavelAssinatura: prev.primeiroResponsavel.nomeCompleto,
        cpfAssinatura: prev.primeiroResponsavel.cpf
      }));
    }
  }, [form.primeiroResponsavel.nomeCompleto, form.primeiroResponsavel.cpf, form.responsavelAssinatura]);

  // Copiar endereço do inscrito para o primeiro responsável
  const handleCopiarEnderecoInscrito = () => {
    setForm(prev => ({
      ...prev,
      primeiroResponsavel: {
        ...prev.primeiroResponsavel,
        endereco: prev.endereco,
        numero: prev.numero,
        complemento: prev.complemento,
        bairro: prev.bairro,
        cidade: prev.cidade,
        uf: prev.uf,
        cep: prev.cep,
      }
    }));
    setFeedbackMsg('Endereço copiado com sucesso!');
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  // Preencher dados rápidos de demonstração
  const handlePreencherExemplo = () => {
    const ano = 2014;
    setForm(prev => ({
      ...prev,
      nomeCompleto: 'Matheus Prado Oliveira',
      sexo: 'M',
      dataNascimento: `${ano}-08-20`,
      naturalidade: 'Franca',
      ufNaturalidade: 'SP',
      estadoCivil: 'Solteiro',
      rg: '58.331.290-X',
      cpf: '462.819.330-14',
      endereco: 'Rua São Paulo',
      numero: '1420',
      complemento: '',
      bairro: 'Jardim Paineiras',
      cidade: 'Franca',
      uf: 'SP',
      cep: '14409-403',
      telefone1: '(16) 99244-8811',
      telefone2: '(16) 3721-9000',
      email: 'matheus.prado@exemplo.com',
      profissao: 'Estudante',
      escolaridade: '6º ano Ensino Fundamental',
      religiao: 'Católica',
      primeiroResponsavel: {
        nomeCompleto: 'Renata Prado Oliveira',
        sexo: 'F',
        dataNascimento: '1986-04-15',
        estadoCivil: 'Casada',
        rg: '32.190.441-2',
        cpf: '281.990.112-40',
        grauParentesco: 'Mãe',
        endereco: 'Rua São Paulo',
        numero: '1420',
        complemento: '',
        bairro: 'Jardim Paineiras',
        cidade: 'Franca',
        uf: 'SP',
        cep: '14409-403',
        telefone1: '(16) 99244-8811',
        telefone2: '',
        email: 'renata.prado@clinica.com.br',
        profissao: 'Psicóloga',
        escolaridade: 'Pós-graduação'
      },
      temSegundoResponsavel: true,
      segundoResponsavel: {
        nomeCompleto: 'Alexandre Oliveira',
        sexo: 'M',
        dataNascimento: '1984-10-10',
        estadoCivil: 'Casado',
        rg: '30.812.339-0',
        cpf: '240.119.882-90',
        grauParentesco: 'Pai',
        endereco: 'Rua São Paulo',
        numero: '1420',
        complemento: '',
        bairro: 'Jardim Paineiras',
        cidade: 'Franca',
        uf: 'SP',
        cep: '14409-403',
        telefone1: '(16) 99188-7722',
        telefone2: '',
        email: 'alexandre.oliveira@empresa.com',
        profissao: 'Administrador',
        escolaridade: 'Superior Completo'
      },
      responsavelGuarda: 'Ambos / Compartilhada',
      responsavelGuardaOutro: '',
      outroResponsavelCiencia: true,
      outroResponsavelConcorda: true,
      regimeConvivenciaVisitas: 'Residência conjunta',
      contatosEmergencia: [
        { id: '1', nome: 'Vovó Helena', parentesco: 'Avó', telefone: '(16) 99311-2299' }
      ],
      fichaMedica: {
        ...prev.fichaMedica,
        altura: '1.48',
        peso: '41',
        tipoSanguineo: 'O+',
        fatorRh: 'Positivo',
        equipamentosAuxilio: ['Óculos'],
        equipamentosAuxilioOutros: '',
        doencasPregressas: ['Bronquite', 'Sinusite'],
        condicoesTratamento: '',
        outrasInformacoesClinicas: '',
        apresentaNeurodivergencia: false,
        autismoTea: false,
        autismoNivelSuporte: '',
        autismoGatilhos: '',
        tdah: false,
        tdahPredominio: '',
        tdahObservacoes: '',
        outrasCondicoesNeuro: [],
        outraCondicaoNaoListada: '',
        cuidadosPedagogicos: '',
        medicacoesQuadroNeuro: '',
        medicamentoContinuo: false,
        medicamentosDetalhes: '',
        autorizaAdministracaoMedicamentos: true,
        restricoesMedicamentos: '',
        urgenciaEmergenciaMedica: 'Autoriza intervenção médica imediata',
        avisarPrioritariamente: 'Pais/Responsáveis legais',
        avisarPrioritariamenteOutro: '',
        avisarPrioritariamenteTelefone: '',
        possuiPlanoSaude: true,
        planoOperadora: 'Unimed Franca',
        planoNumeroCarteirinha: '0129.8821.9930',
        planoMedicoReferencia: 'Dr. Lucas Silveira',
        planoTelefoneMedico: '(16) 3711-2000',
        apresentaAlergia: true,
        alergiaPicadaInsetos: true,
        alergiaPicadaInsetosDetalhes: 'Picada de vespa ou marimbondo',
        alergiaMedicamentos: false,
        alergiaMedicamentosDetalhes: '',
        alergiaPlantasPolen: false,
        alergiaPlantasPolenDetalhes: '',
        alergiaAlimentos: false,
        alergiaAlimentosDetalhes: '',
        alergiaOutras: false,
        alergiaOutrasDetalhes: '',
        impedidoAtividadesArLivre: false,
        impedidoAtividadesDetalhes: '',
        restricoesAlimentares: false,
        restricoesAlimentaresDetalhes: '',
        cardiopatias: false,
        cardiopatiasDetalhes: '',
        sabeNadar: true,
        historicoSonambulismo: false,
        transtornoComportamento: false,
        transtornoComportamentoDetalhes: '',
        transtornoAlimentar: false,
        transtornoAlimentarDetalhes: '',
        transtornoAnsiedadeFobia: false,
        transtornoAnsiedadeFobiaDetalhes: '',
        apresentaDeficiencia: false,
        tiposDeficiencia: [],
        deficienciaEspecificar: ''
      },
      responsavelAssinatura: 'Renata Prado Oliveira',
      cpfAssinatura: '281.990.112-40',
      dataAssinatura: '2026-03-20',
      cidadeAssinatura: 'Franca/SP'
    }));
    setFeedbackMsg('Exemplo preenchido automaticamente!');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Toggle doencas pregressas
  const handleToggleDoenca = (doenca: string) => {
    setForm(prev => {
      const exists = prev.fichaMedica.doencasPregressas.includes(doenca);
      const updated = exists
        ? prev.fichaMedica.doencasPregressas.filter(d => d !== doenca)
        : [...prev.fichaMedica.doencasPregressas, doenca];
      return {
        ...prev,
        fichaMedica: {
          ...prev.fichaMedica,
          doencasPregressas: updated
        }
      };
    });
  };

  // Toggle equipamentos auxilio
  const handleToggleEquipamento = (equip: string) => {
    setForm(prev => {
      const exists = prev.fichaMedica.equipamentosAuxilio.includes(equip);
      const updated = exists
        ? prev.fichaMedica.equipamentosAuxilio.filter(e => e !== equip)
        : [...prev.fichaMedica.equipamentosAuxilio, equip];
      return {
        ...prev,
        fichaMedica: {
          ...prev.fichaMedica,
          equipamentosAuxilio: updated
        }
      };
    });
  };

  // Processamento e compressão inteligente da foto 3x4 (Canvas HTML5)
  const processarArquivoFoto = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErroFoto('Por favor, selecione um arquivo de imagem válido (JPG, PNG ou WEBP).');
      return;
    }

    setProcessandoFoto(true);
    setErroFoto(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Dimensões ideais para foto 3x4 (360 x 480 pixels)
          const targetWidth = 360;
          const targetHeight = 480;
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Falha ao abrir contexto canvas.');
          }

          // Crop centralizado proporcional para 3x4 com foco no rosto/terço superior
          const imgRatio = img.width / img.height;
          const targetRatio = targetWidth / targetHeight; // 0.75

          let sx = 0;
          let sy = 0;
          let sWidth = img.width;
          let sHeight = img.height;

          if (imgRatio > targetRatio) {
            // Imagem mais larga que 3x4 (crop horizontal centralizado)
            sWidth = img.height * targetRatio;
            sx = (img.width - sWidth) / 2;
          } else {
            // Imagem mais alta que 3x4 (crop vertical favorecendo o topo onde fica a cabeça)
            sHeight = img.width / targetRatio;
            sy = Math.max(0, (img.height - sHeight) * 0.25);
          }

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

          // Gera JPEG de excelente nitidez e tamanho extremamente leve (~30KB)
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setForm(prev => ({ ...prev, foto: compressed }));
          setProcessandoFoto(false);
          setFeedbackMsg('Foto 3x4 ajustada e salva com sucesso!');
          setTimeout(() => setFeedbackMsg(null), 3000);
        } catch (err) {
          console.warn('Erro ao redimensionar foto, mantendo original:', err);
          setForm(prev => ({ ...prev, foto: event.target?.result as string }));
          setProcessandoFoto(false);
        }
      };
      img.onerror = () => {
        setErroFoto('Não foi possível ler a imagem. Tente outro arquivo.');
        setProcessandoFoto(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setErroFoto('Erro ao carregar o arquivo da imagem.');
      setProcessandoFoto(false);
    };
    reader.readAsDataURL(file);
  };

  // Iniciar captura com Webcam (compatível com desktop e navegadores com suporte a câmera)
  const iniciarWebcam = async () => {
    try {
      setErroFoto(null);
      setModalWebcamAberta(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      setWebcamStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Erro play video:', e));
      }
    } catch (err) {
      console.warn('Acesso à webcam recusado ou indisponível:', err);
      setErroFoto('Câmera indisponível no navegador. Use os botões "Tirar com o Celular" ou "Enviar da Galeria".');
      setModalWebcamAberta(false);
    }
  };

  const pararWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(t => t.stop());
      setWebcamStream(null);
    }
    setModalWebcamAberta(false);
  };

  const capturarFotoWebcam = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const targetWidth = 360;
      const targetHeight = 480;
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const vWidth = video.videoWidth || 640;
        const vHeight = video.videoHeight || 480;
        const vRatio = vWidth / vHeight;
        const targetRatio = targetWidth / targetHeight;

        let sx = 0;
        let sy = 0;
        let sw = vWidth;
        let sh = vHeight;

        if (vRatio > targetRatio) {
          sw = vHeight * targetRatio;
          sx = (vWidth - sw) / 2;
        } else {
          sh = vWidth / targetRatio;
          sy = Math.max(0, (vHeight - sh) * 0.25);
        }

        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setForm(prev => ({ ...prev, foto: dataUrl }));
        setFeedbackMsg('Foto capturada pela webcam!');
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
      pararWebcam();
    } catch (e) {
      console.error('Erro ao capturar foto da webcam:', e);
      setErroFoto('Erro ao capturar imagem da webcam.');
      pararWebcam();
    }
  };

  // Submissão final
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nomeCompleto.trim()) {
      alert('Por favor, informe o Nome Completo do inscrito na Etapa 1.');
      setEtapa(1);
      return;
    }
    if (!form.dataNascimento) {
      alert('Por favor, informe a Data de Nascimento do inscrito na Etapa 1.');
      setEtapa(1);
      return;
    }
    if (!form.bairro.trim()) {
      alert('Por favor, informe o Bairro de residência em Franca.');
      setEtapa(1);
      return;
    }
    if (!form.primeiroResponsavel.nomeCompleto.trim()) {
      alert('Por favor, informe o Nome do 1º Responsável Legal na Etapa 2.');
      setEtapa(2);
      return;
    }
    if (!form.responsavelAssinatura.trim()) {
      alert('Por favor, informe o Nome do Responsável que assina o termo na Etapa 4.');
      setEtapa(4);
      return;
    }

    setSalvando(true);
    setTimeout(() => {
      onSave(form);
      setSalvando(false);
    }, 400);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
      {/* Top Banner & Control */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Grupo Escoteiro Tradicional 22 de Fevereiro • Franca/SP</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
            {initialData ? 'Editar Cadastro do Escoteiro' : 'Ficha de Inscrição Individual & Médica'}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Preencha todos os dados conforme o formulário oficial de admissão.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {onPrint && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                const printable: EscoteiroCadastro = {
                  ...form,
                  id: form.id || `esc-temp-${Date.now()}`,
                  nomeCompleto: form.nomeCompleto.trim() || 'Escoteiro (Ficha em Preenchimento)'
                };
                onPrint(printable);
              }}
              className="px-3 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 rounded-lg border border-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Visualizar ou Imprimir Ficha Oficial Deste Escoteiro"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-800" />
              <span>Imprimir Ficha Oficial</span>
            </button>
          )}
          {!initialData && (
            <button
              type="button"
              onClick={handlePreencherExemplo}
              className="px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Preencher Exemplo</span>
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Step Indicators */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          {[
            { num: 1, title: '1. Inscrito', desc: 'Dados Pessoais', icon: User },
            { num: 2, title: '2. Família', desc: 'Responsáveis & Guarda', icon: Users },
            { num: 3, title: '3. Ficha Médica', desc: 'Saúde & Cuidados', icon: HeartPulse },
            { num: 4, title: '4. Termos', desc: 'Imagem & Assinatura', icon: FileCheck },
          ].map(s => {
            const Icon = s.icon;
            const ativo = etapa === s.num;
            const concluido = etapa > s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setEtapa(s.num)}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  ativo
                    ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-600/20'
                    : concluido
                    ? 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    : 'bg-white border-stone-200/60 text-stone-400 hover:bg-stone-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  ativo ? 'bg-emerald-700 text-white' : concluido ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-400'
                }`}>
                  {concluido ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-bold truncate ${ativo ? 'text-emerald-950' : 'text-stone-800'}`}>
                    {s.title}
                  </div>
                  <div className="text-[11px] text-stone-500 truncate">{s.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ========================================================= */}
        {/* ETAPA 1: DADOS DO INSCRITO */}
        {/* ========================================================= */}
        {etapa === 1 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm space-y-6">
            <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-700" />
                  <span>1. Dados do Inscrito (Jovem ou Adulto)</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Informações civis e de contato do membro do Grupo Escoteiro
                </p>
              </div>

              {/* Instant Age and Branch indicator */}
              {form.dataNascimento && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-900">
                  <span>Idade: <strong>{idadeAtual} anos</strong></span>
                  <span>·</span>
                  <span>Ramo: <strong className="text-emerald-700">{ramoAtual}</strong></span>
                </div>
              )}
            </div>

            {/* Hidden inputs para seleção de arquivo e câmera mobile */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  processarArquivoFoto(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="user"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  processarArquivoFoto(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* ========================================================= */}
              {/* FOTO 3X4 DO INSCRITO: UPLOAD OU CÂMERA DO CELULAR */}
              {/* ========================================================= */}
              <div className="md:col-span-12 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-50 via-emerald-50/20 to-stone-50 border border-stone-200 shadow-2xs">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  
                  {/* Frame 3x4 com Preview */}
                  <div className="relative shrink-0">
                    <div className="w-28 h-36 sm:w-32 sm:h-40 rounded-2xl overflow-hidden bg-white border-2 border-stone-300 shadow-sm flex flex-col items-center justify-center text-center relative group">
                      {form.foto ? (
                        <>
                          <img 
                            src={form.foto} 
                            alt="Foto 3x4 do Escoteiro" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-stone-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => cameraInputRef.current?.click()}
                              title="Tirar nova foto com a câmera"
                              className="p-2 bg-amber-500 text-emerald-950 rounded-xl shadow-md hover:bg-amber-400 cursor-pointer"
                            >
                              <Camera className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setForm(prev => ({ ...prev, foto: '' }))}
                              title="Remover foto"
                              className="p-2 bg-rose-600 text-white rounded-xl shadow-md hover:bg-rose-500 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-3 flex flex-col items-center justify-center text-stone-400 select-none">
                          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-1 text-stone-300">
                            <User className="w-7 h-7" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Foto 3x4</span>
                          <span className="text-[9px] text-stone-400 mt-0.5">Opcional</span>
                        </div>
                      )}

                      {processandoFoto && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-2xs flex flex-col items-center justify-center p-2 text-center">
                          <RefreshCw className="w-6 h-6 text-emerald-700 animate-spin mb-1" />
                          <span className="text-[10px] font-bold text-emerald-900">Ajustando foto...</span>
                        </div>
                      )}
                    </div>

                    {form.foto && (
                      <span className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1 rounded-full shadow-md border-2 border-white">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  {/* Informações e Botões de Upload e Câmera */}
                  <div className="flex-1 text-center sm:text-left space-y-2.5 min-w-0">
                    <div>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-emerald-700" />
                          <span>Foto 3x4 do Inscrito</span>
                        </h4>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Ficha Oficial & Carteirinha
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        Você pode tirar uma foto agora mesmo com a câmera do seu celular ou fazer upload da galeria/arquivos.
                      </p>
                    </div>

                    {erroFoto && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{erroFoto}</span>
                      </div>
                    )}

                    {/* Botões de Ação */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      
                      {/* Botão Câmera do Celular / Smartphone */}
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-emerald-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Smartphone className="w-4 h-4 text-emerald-950 shrink-0" />
                        <Camera className="w-4 h-4 text-emerald-950 shrink-0" />
                        <span>Tirar Foto com o Celular</span>
                      </button>

                      {/* Botão Upload de Arquivo / Galeria */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2.5 bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl border border-stone-300 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-stone-600 shrink-0" />
                        <span>Fazer Upload / Galeria</span>
                      </button>

                      {/* Botão Webcam Desktop */}
                      <button
                        type="button"
                        onClick={iniciarWebcam}
                        className="hidden sm:inline-flex px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-xl border border-emerald-200 transition-all items-center gap-1.5 cursor-pointer"
                      >
                        <Video className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>Webcam PC</span>
                      </button>

                      {/* Botão Remover Foto */}
                      {form.foto && (
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, foto: '' }))}
                          className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl border border-rose-200 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remover Foto</span>
                        </button>
                      )}
                    </div>

                    <div className="text-[11px] text-stone-400 flex items-center gap-1 justify-center sm:justify-start">
                      <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>A foto é enquadrada e otimizada automaticamente no formato oficial 3x4.</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Nome Completo */}
              <div className="md:col-span-8">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={form.nomeCompleto}
                  onChange={e => setForm({ ...form, nomeCompleto: e.target.value })}
                  placeholder="Nome completo do escoteiro"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Sexo */}
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Sexo *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, sexo: 'M' })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                      form.sexo === 'M'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    ( M ) Masculino
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, sexo: 'F' })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                      form.sexo === 'F'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    ( F ) Feminino
                  </button>
                </div>
              </div>

              {/* Data de Nascimento */}
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  required
                  value={form.dataNascimento}
                  onChange={e => setForm({ ...form, dataNascimento: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Naturalidade & UF */}
              <div className="md:col-span-5">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Naturalidade (Cidade)
                </label>
                <input
                  type="text"
                  value={form.naturalidade}
                  onChange={e => setForm({ ...form, naturalidade: e.target.value })}
                  placeholder="Ex: Franca"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  UF
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={form.ufNaturalidade}
                  onChange={e => setForm({ ...form, ufNaturalidade: e.target.value.toUpperCase() })}
                  placeholder="SP"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm uppercase focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Estado Civil, RG e CPF */}
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Estado Civil
                </label>
                <select
                  value={form.estadoCivil}
                  onChange={e => setForm({ ...form, estadoCivil: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="Solteiro(a)">Solteiro(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="União Estável">União Estável</option>
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Identidade (RG)
                </label>
                <input
                  type="text"
                  value={form.rg}
                  onChange={e => setForm({ ...form, rg: e.target.value })}
                  placeholder="00.000.000-0"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  value={form.cpf}
                  onChange={e => setForm({ ...form, cpf: formatarCPF(e.target.value) })}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Endereço Completo */}
              <div className="md:col-span-7">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Endereço (Rua / Avenida) *
                </label>
                <input
                  type="text"
                  required
                  value={form.endereco}
                  onChange={e => setForm({ ...form, endereco: e.target.value })}
                  placeholder="Ex: Rua General Carneiro"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Nº *
                </label>
                <input
                  type="text"
                  required
                  value={form.numero}
                  onChange={e => setForm({ ...form, numero: e.target.value })}
                  placeholder="123"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  value={form.complemento}
                  onChange={e => setForm({ ...form, complemento: e.target.value })}
                  placeholder="Apto, Bloco..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Bairro, Cidade, UF, CEP */}
              <div className="md:col-span-5">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Bairro *
                </label>
                <input
                  type="text"
                  required
                  value={form.bairro}
                  onChange={e => setForm({ ...form, bairro: e.target.value })}
                  placeholder="Ex: Jardim Paineiras, Centro, Estação..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={form.cidade}
                  onChange={e => setForm({ ...form, cidade: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  UF
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={form.uf}
                  onChange={e => setForm({ ...form, uf: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm uppercase focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={form.cep}
                  onChange={e => setForm({ ...form, cep: formatarCEP(e.target.value) })}
                  placeholder="14400-000"
                  maxLength={9}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Telefones & E-mail */}
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Telefone 1 *
                </label>
                <input
                  type="text"
                  required
                  value={form.telefone1}
                  onChange={e => setForm({ ...form, telefone1: formatarTelefone(e.target.value) })}
                  placeholder="(16) 90000-0000"
                  maxLength={15}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Telefone 2 (Fixo / Recado)
                </label>
                <input
                  type="text"
                  value={form.telefone2}
                  onChange={e => setForm({ ...form, telefone2: formatarTelefone(e.target.value) })}
                  placeholder="(16) 3700-0000"
                  maxLength={15}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Profissão, Escolaridade e Religião */}
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Profissão / Ocupação
                </label>
                <input
                  type="text"
                  value={form.profissao}
                  onChange={e => setForm({ ...form, profissao: e.target.value })}
                  placeholder="Estudante, Estagiário..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Escolaridade
                </label>
                <input
                  type="text"
                  value={form.escolaridade}
                  onChange={e => setForm({ ...form, escolaridade: e.target.value })}
                  placeholder="Ex: 5º ano Ensino Fundamental"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Religião professada pelo jovem e família
                </label>
                <input
                  type="text"
                  value={form.religiao}
                  onChange={e => setForm({ ...form, religiao: e.target.value })}
                  placeholder="Católica, Evangélica, Espírita..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ETAPA 2: RESPONSÁVEIS, GUARDA E EMERGÊNCIA */}
        {/* ========================================================= */}
        {etapa === 2 && (
          <div className="space-y-6">
            
            {/* 2. Primeiro Responsável Legal */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm space-y-6">
              <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-700" />
                    <span>2. Primeiro Responsável Legal</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Preencher obrigatoriamente se o inscrito for menor de idade
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopiarEnderecoInscrito}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Copy className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Mesmo endereço do inscrito</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Nome Completo do Responsável *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.primeiroResponsavel.nomeCompleto}
                    onChange={e => setForm({
                      ...form,
                      primeiroResponsavel: { ...form.primeiroResponsavel, nomeCompleto: e.target.value }
                    })}
                    placeholder="Nome completo do pai, mãe ou tutor"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Grau de Parentesco *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.primeiroResponsavel.grauParentesco}
                    onChange={e => setForm({
                      ...form,
                      primeiroResponsavel: { ...form.primeiroResponsavel, grauParentesco: e.target.value }
                    })}
                    placeholder="Mãe, Pai, Avó, Tutor legal..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    CPF do Responsável *
                  </label>
                  <input
                    type="text"
                    value={form.primeiroResponsavel.cpf}
                    onChange={e => setForm({
                      ...form,
                      primeiroResponsavel: { ...form.primeiroResponsavel, cpf: formatarCPF(e.target.value) }
                    })}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    RG
                  </label>
                  <input
                    type="text"
                    value={form.primeiroResponsavel.rg}
                    onChange={e => setForm({
                      ...form,
                      primeiroResponsavel: { ...form.primeiroResponsavel, rg: e.target.value }
                    })}
                    placeholder="00.000.000-0"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Telefone 1 (WhatsApp) *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.primeiroResponsavel.telefone1}
                    onChange={e => setForm({
                      ...form,
                      primeiroResponsavel: { ...form.primeiroResponsavel, telefone1: formatarTelefone(e.target.value) }
                    })}
                    placeholder="(16) 90000-0000"
                    maxLength={15}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-6">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    E-mail do Responsável
                  </label>
                  <input
                    type="email"
                    value={form.primeiroResponsavel.email}
                    onChange={e => setForm({
                      ...form,
                      primeiroResponsavel: { ...form.primeiroResponsavel, email: e.target.value }
                    })}
                    placeholder="email@responsavel.com"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-6">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Profissão
                  </label>
                  <input
                    type="text"
                    value={form.primeiroResponsavel.profissao}
                    onChange={e => setForm({
                      ...form,
                      primeiroResponsavel: { ...form.primeiroResponsavel, profissao: e.target.value }
                    })}
                    placeholder="Ocupação profissional"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Endereço do responsável */}
                <div className="md:col-span-7">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={form.primeiroResponsavel.endereco}
                    onChange={e => setForm({
                      ...form,
                      primeiroResponsavel: { ...form.primeiroResponsavel, endereco: e.target.value }
                    })}
                    placeholder="Rua / Avenida"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Nº
                  </label>
                  <input
                    type="text"
                    value={form.primeiroResponsavel.numero}
                    onChange={e => setForm({
                      ...form,
                      primeiroResponsavel: { ...form.primeiroResponsavel, numero: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={form.primeiroResponsavel.bairro}
                    onChange={e => setForm({
                      ...form,
                      primeiroResponsavel: { ...form.primeiroResponsavel, bairro: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Segundo Responsável Legal (Opcional) */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    3. Segundo Responsável Legal (Opcional)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Outro genitor ou segundo responsável legal pelo jovem
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.temSegundoResponsavel}
                    onChange={e => setForm({ ...form, temSegundoResponsavel: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {form.temSegundoResponsavel && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
                  <div className="md:col-span-8">
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Nome Completo do 2º Responsável
                    </label>
                    <input
                      type="text"
                      value={form.segundoResponsavel.nomeCompleto}
                      onChange={e => setForm({
                        ...form,
                        segundoResponsavel: { ...form.segundoResponsavel, nomeCompleto: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Parentesco
                    </label>
                    <input
                      type="text"
                      value={form.segundoResponsavel.grauParentesco}
                      onChange={e => setForm({
                        ...form,
                        segundoResponsavel: { ...form.segundoResponsavel, grauParentesco: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={form.segundoResponsavel.telefone1}
                      onChange={e => setForm({
                        ...form,
                        segundoResponsavel: { ...form.segundoResponsavel, telefone1: formatarTelefone(e.target.value) }
                      })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      CPF
                    </label>
                    <input
                      type="text"
                      value={form.segundoResponsavel.cpf}
                      onChange={e => setForm({
                        ...form,
                        segundoResponsavel: { ...form.segundoResponsavel, cpf: formatarCPF(e.target.value) }
                      })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Profissão
                    </label>
                    <input
                      type="text"
                      value={form.segundoResponsavel.profissao}
                      onChange={e => setForm({
                        ...form,
                        segundoResponsavel: { ...form.segundoResponsavel, profissao: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. Situação Familiar e Guarda */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-base font-bold text-stone-900">
                  4. Situação Familiar e Guarda (em caso de pais separados ou divorciados)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                    Responsável pela Guarda:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['Pai', 'Mãe', 'Ambos / Compartilhada', 'Outro'] as const).map(op => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => setForm({ ...form, responsavelGuarda: op })}
                        className={`py-2 px-2.5 text-xs font-semibold rounded-xl border text-center transition-all ${
                          form.responsavelGuarda === op
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {op}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                    Outro responsável tem ciência?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, outroResponsavelCiencia: true })}
                      className={`py-2 text-xs font-bold rounded-xl border text-center ${
                        form.outroResponsavelCiencia ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-stone-50 text-stone-700'
                      }`}
                    >
                      ( X ) Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, outroResponsavelCiencia: false })}
                      className={`py-2 text-xs font-bold rounded-xl border text-center ${
                        !form.outroResponsavelCiencia ? 'bg-amber-600 text-white border-amber-600' : 'bg-stone-50 text-stone-700'
                      }`}
                    >
                      ( ) Não
                    </button>
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                    Concorda com o ingresso?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, outroResponsavelConcorda: true })}
                      className={`py-2 text-xs font-bold rounded-xl border text-center ${
                        form.outroResponsavelConcorda ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-stone-50 text-stone-700'
                      }`}
                    >
                      ( X ) Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, outroResponsavelConcorda: false })}
                      className={`py-2 text-xs font-bold rounded-xl border text-center ${
                        !form.outroResponsavelConcorda ? 'bg-amber-600 text-white border-amber-600' : 'bg-stone-50 text-stone-700'
                      }`}
                    >
                      ( ) Não
                    </button>
                  </div>
                </div>

                <div className="md:col-span-12">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Regime de Convivência e Visitas Vigente
                  </label>
                  <input
                    type="text"
                    value={form.regimeConvivenciaVisitas}
                    onChange={e => setForm({ ...form, regimeConvivenciaVisitas: e.target.value })}
                    placeholder="Ex: Convivência diária, fins de semana alternados, etc."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 5. Contatos Adicionais de Emergência */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    5. Contatos Adicionais de Emergência
                  </h3>
                  <p className="text-xs text-stone-500">
                    Pessoas de confiança para contato imediato em caso de impossibilidade dos pais
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const novoId = String(Date.now());
                    setForm({
                      ...form,
                      contatosEmergencia: [...form.contatosEmergencia, { id: novoId, nome: '', parentesco: '', telefone: '' }]
                    });
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Contato</span>
                </button>
              </div>

              <div className="space-y-3">
                {form.contatosEmergencia.map((c, idx) => (
                  <div key={c.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-3 bg-stone-50 rounded-xl border border-stone-200/60">
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        value={c.nome}
                        onChange={e => {
                          const updated = [...form.contatosEmergencia];
                          updated[idx].nome = e.target.value;
                          setForm({ ...form, contatosEmergencia: updated });
                        }}
                        placeholder={`Contato ${idx + 1}: Nome Completo`}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={c.parentesco}
                        onChange={e => {
                          const updated = [...form.contatosEmergencia];
                          updated[idx].parentesco = e.target.value;
                          setForm({ ...form, contatosEmergencia: updated });
                        }}
                        placeholder="Parentesco (Avó, Tio...)"
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={c.telefone}
                        onChange={e => {
                          const updated = [...form.contatosEmergencia];
                          updated[idx].telefone = formatarTelefone(e.target.value);
                          setForm({ ...form, contatosEmergencia: updated });
                        }}
                        placeholder="(16) 90000-0000"
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      {form.contatosEmergencia.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setForm({
                              ...form,
                              contatosEmergencia: form.contatosEmergencia.filter(item => item.id !== c.id)
                            });
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* ETAPA 3: FICHA MÉDICA COMPLETA (PÁGINAS 2 E 3 DA FICHA) */}
        {/* ========================================================= */}
        {etapa === 3 && (
          <div className="space-y-6">
            
            {/* Header Ficha Médica */}
            <div className="bg-emerald-900 text-white p-6 rounded-2xl shadow-md border border-emerald-800">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                <HeartPulse className="w-4 h-4" />
                <span>Documento Oficial de Saúde</span>
              </div>
              <h3 className="text-xl font-bold font-serif">
                Ficha Médica do Escoteiro
              </h3>
              <p className="text-xs text-emerald-200 mt-1">
                Todas as informações são confidenciais e fundamentais para a segurança em sedes e acampamentos.
              </p>
            </div>

            {/* 1. Identificação e Dados Físicos */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
              <h4 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
                1. Identificação e Dados Físicos
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Nº Registro Interno
                  </label>
                  <input
                    type="text"
                    value={form.fichaMedica.numeroRegistro}
                    onChange={e => setForm({
                      ...form,
                      fichaMedica: { ...form.fichaMedica, numeroRegistro: e.target.value }
                    })}
                    placeholder="GET-2026-..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Altura (m)
                  </label>
                  <input
                    type="text"
                    value={form.fichaMedica.altura}
                    onChange={e => setForm({
                      ...form,
                      fichaMedica: { ...form.fichaMedica, altura: e.target.value }
                    })}
                    placeholder="Ex: 1.45"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Peso (kg)
                  </label>
                  <input
                    type="text"
                    value={form.fichaMedica.peso}
                    onChange={e => setForm({
                      ...form,
                      fichaMedica: { ...form.fichaMedica, peso: e.target.value }
                    })}
                    placeholder="Ex: 40"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Tipo Sanguíneo
                  </label>
                  <select
                    value={form.fichaMedica.tipoSanguineo}
                    onChange={e => setForm({
                      ...form,
                      fichaMedica: { ...form.fichaMedica, tipoSanguineo: e.target.value as TipoSanguineo }
                    })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold text-stone-800"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="Não Informado">Não Informado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Fator RH
                  </label>
                  <select
                    value={form.fichaMedica.fatorRh}
                    onChange={e => setForm({
                      ...form,
                      fichaMedica: { ...form.fichaMedica, fatorRh: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm"
                  >
                    <option value="Positivo">Positivo (+)</option>
                    <option value="Negativo">Negativo (-)</option>
                    <option value="Não Informado">Não Informado</option>
                  </select>
                </div>
              </div>

              {/* Equipamentos de auxílio */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                  Equipamentos de auxílio em uso:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {EQUIPAMENTOS_LISTA.map(eq => {
                    const sel = form.fichaMedica.equipamentosAuxilio.includes(eq);
                    return (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => handleToggleEquipamento(eq)}
                        className={`py-2 px-2.5 text-xs font-medium rounded-xl border text-center transition-all ${
                          sel ? 'bg-emerald-700 text-white border-emerald-700 font-bold' : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {sel ? `(X) ${eq}` : `( ) ${eq}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. Histórico Clínico Geral */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
              <h4 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
                2. Histórico Clínico Geral (Doenças pregressas ou em tratamento)
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {DOENCAS_LISTA.map(d => {
                  const sel = form.fichaMedica.doencasPregressas.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleToggleDoenca(d)}
                      className={`py-2 px-2 text-xs rounded-xl border text-center transition-all ${
                        sel ? 'bg-amber-600 text-white border-amber-600 font-bold' : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {sel ? `(X) ${d}` : `( ) ${d}`}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Condições atualmente em tratamento:
                  </label>
                  <textarea
                    rows={2}
                    value={form.fichaMedica.condicoesTratamento}
                    onChange={e => setForm({
                      ...form,
                      fichaMedica: { ...form.fichaMedica, condicoesTratamento: e.target.value }
                    })}
                    placeholder="Descreva se estiver tratando alguma condição no momento"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Outras informações clínicas relevantes:
                  </label>
                  <textarea
                    rows={2}
                    value={form.fichaMedica.outrasInformacoesClinicas}
                    onChange={e => setForm({
                      ...form,
                      fichaMedica: { ...form.fichaMedica, outrasInformacoesClinicas: e.target.value }
                    })}
                    placeholder="Cirurgias prévias, fraturas, observações adicionais..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 3. Neurodivergências e Neurodesenvolvimento */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h4 className="text-base font-bold text-stone-900">
                  3. Neurodivergências e Condições do Neurodesenvolvimento
                </h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({
                      ...form,
                      fichaMedica: { ...form.fichaMedica, apresentaNeurodivergencia: false }
                    })}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                      !form.fichaMedica.apresentaNeurodivergencia ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    ( ) Não
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({
                      ...form,
                      fichaMedica: { ...form.fichaMedica, apresentaNeurodivergencia: true }
                    })}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                      form.fichaMedica.apresentaNeurodivergencia ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    ( X ) Sim
                  </button>
                </div>
              </div>

              {form.fichaMedica.apresentaNeurodivergencia && (
                <div className="space-y-4 pt-2 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
                  
                  {/* TEA */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-white rounded-xl border border-stone-200/60">
                    <div className="md:col-span-4">
                      <label className="flex items-center gap-2 text-xs font-bold text-stone-900">
                        <input
                          type="checkbox"
                          checked={form.fichaMedica.autismoTea}
                          onChange={e => setForm({
                            ...form,
                            fichaMedica: { ...form.fichaMedica, autismoTea: e.target.checked }
                          })}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span>Autismo (TEA - Transtorno do Espectro Autista)</span>
                      </label>
                      {form.fichaMedica.autismoTea && (
                        <div className="mt-2 flex gap-1">
                          {(['Nível 1', 'Nível 2', 'Nível 3'] as const).map(nv => (
                            <button
                              key={nv}
                              type="button"
                              onClick={() => setForm({
                                ...form,
                                fichaMedica: { ...form.fichaMedica, autismoNivelSuporte: nv }
                              })}
                              className={`px-2 py-1 text-[11px] font-semibold rounded-md border ${
                                form.fichaMedica.autismoNivelSuporte === nv ? 'bg-emerald-700 text-white' : 'bg-stone-50 text-stone-600'
                              }`}
                            >
                              {nv}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-8">
                      <input
                        type="text"
                        value={form.fichaMedica.autismoGatilhos}
                        onChange={e => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, autismoGatilhos: e.target.value }
                        })}
                        placeholder="Observações / Gatilhos de sobrecarga sensorial (ruídos, multidões, luz)..."
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* TDAH */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-white rounded-xl border border-stone-200/60">
                    <div className="md:col-span-4">
                      <label className="flex items-center gap-2 text-xs font-bold text-stone-900">
                        <input
                          type="checkbox"
                          checked={form.fichaMedica.tdah}
                          onChange={e => setForm({
                            ...form,
                            fichaMedica: { ...form.fichaMedica, tdah: e.target.checked }
                          })}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span>TDAH (Déficit de Atenção e Hiperatividade)</span>
                      </label>
                      {form.fichaMedica.tdah && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(['Hiperatividade', 'Desatenção', 'Impulsividade', 'Combinado'] as const).map(pred => (
                            <button
                              key={pred}
                              type="button"
                              onClick={() => setForm({
                                ...form,
                                fichaMedica: { ...form.fichaMedica, tdahPredominio: pred }
                              })}
                              className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${
                                form.fichaMedica.tdahPredominio === pred ? 'bg-emerald-700 text-white' : 'bg-stone-50 text-stone-600'
                              }`}
                            >
                              {pred}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-8">
                      <input
                        type="text"
                        value={form.fichaMedica.tdahObservacoes}
                        onChange={e => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, tdahObservacoes: e.target.value }
                        })}
                        placeholder="Observações pedagógicas para chefes de seção..."
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* Cuidados Pedagógicos */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Cuidados, adaptações e condutas pedagógicas recomendadas nas atividades:
                    </label>
                    <textarea
                      rows={2}
                      value={form.fichaMedica.cuidadosPedagogicos}
                      onChange={e => setForm({
                        ...form,
                        fichaMedica: { ...form.fichaMedica, cuidadosPedagogicos: e.target.value }
                      })}
                      placeholder="Como a equipe de escotistas pode melhor acolher o jovem..."
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. Medicamentos e Condutas Médicas */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
              <h4 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
                4. Medicamentos e Condutas Médicas
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6 space-y-2">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    Faz uso de medicamento contínuo ou temporário?
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({
                        ...form,
                        fichaMedica: { ...form.fichaMedica, medicamentoContinuo: false }
                      })}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                        !form.fichaMedica.medicamentoContinuo ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      ( ) Não
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({
                        ...form,
                        fichaMedica: { ...form.fichaMedica, medicamentoContinuo: true }
                      })}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                        form.fichaMedica.medicamentoContinuo ? 'bg-blue-700 text-white' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      ( X ) Sim
                    </button>
                  </div>
                  {form.fichaMedica.medicamentoContinuo && (
                    <input
                      type="text"
                      value={form.fichaMedica.medicamentosDetalhes}
                      onChange={e => setForm({
                        ...form,
                        fichaMedica: { ...form.fichaMedica, medicamentosDetalhes: e.target.value }
                      })}
                      placeholder="Qual(is), dosagem e horário prescrito"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                    />
                  )}
                </div>

                <div className="md:col-span-6 space-y-2">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    Autoriza administração de medicamentos pela equipe de saúde do Grupo?
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({
                        ...form,
                        fichaMedica: { ...form.fichaMedica, autorizaAdministracaoMedicamentos: true }
                      })}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                        form.fichaMedica.autorizaAdministracaoMedicamentos ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      ( X ) Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({
                        ...form,
                        fichaMedica: { ...form.fichaMedica, autorizaAdministracaoMedicamentos: false }
                      })}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                        !form.fichaMedica.autorizaAdministracaoMedicamentos ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      ( ) Não
                    </button>
                  </div>
                </div>

                <div className="md:col-span-12">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Em caso de urgência/emergência médica:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({
                        ...form,
                        fichaMedica: { ...form.fichaMedica, urgenciaEmergenciaMedica: 'Autoriza intervenção médica imediata' }
                      })}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                        form.fichaMedica.urgenciaEmergenciaMedica === 'Autoriza intervenção médica imediata'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                          : 'bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      ( X ) Autoriza intervenção médica imediata (recomendado)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({
                        ...form,
                        fichaMedica: { ...form.fichaMedica, urgenciaEmergenciaMedica: 'Aguardar acompanhamento dos pais/responsáveis' }
                      })}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                        form.fichaMedica.urgenciaEmergenciaMedica === 'Aguardar acompanhamento dos pais/responsáveis'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                          : 'bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      ( ) Aguardar acompanhamento dos pais/responsáveis
                    </button>
                  </div>
                </div>

                {/* Plano de saúde */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Plano de Saúde
                  </label>
                  <select
                    value={form.fichaMedica.possuiPlanoSaude ? 'sim' : 'nao'}
                    onChange={e => setForm({
                      ...form,
                      fichaMedica: { ...form.fichaMedica, possuiPlanoSaude: e.target.value === 'sim' }
                    })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm"
                  >
                    <option value="sim">Sim (Plano Privado)</option>
                    <option value="nao">Não / Utiliza SUS</option>
                  </select>
                </div>

                {form.fichaMedica.possuiPlanoSaude && (
                  <>
                    <div className="md:col-span-4">
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        Operadora do Plano
                      </label>
                      <input
                        type="text"
                        value={form.fichaMedica.planoOperadora}
                        onChange={e => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, planoOperadora: e.target.value }
                        })}
                        placeholder="Unimed, São Francisco..."
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        Nº da Carteirinha
                      </label>
                      <input
                        type="text"
                        value={form.fichaMedica.planoNumeroCarteirinha}
                        onChange={e => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, planoNumeroCarteirinha: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 5. Alergias e Intolerâncias */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h4 className="text-base font-bold text-stone-900">
                  5. Alergias e Intolerâncias
                </h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({
                      ...form,
                      fichaMedica: { ...form.fichaMedica, apresentaAlergia: false }
                    })}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                      !form.fichaMedica.apresentaAlergia ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    ( ) Não Apresenta
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({
                      ...form,
                      fichaMedica: { ...form.fichaMedica, apresentaAlergia: true }
                    })}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                      form.fichaMedica.apresentaAlergia ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    ( X ) Apresenta Alergia
                  </button>
                </div>
              </div>

              {form.fichaMedica.apresentaAlergia && (
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-stone-50 rounded-xl space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-stone-800">
                      <input
                        type="checkbox"
                        checked={form.fichaMedica.alergiaPicadaInsetos}
                        onChange={e => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, alergiaPicadaInsetos: e.target.checked }
                        })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>Picada de Insetos (Abelhas, formigas, pernilongos)</span>
                    </label>
                    {form.fichaMedica.alergiaPicadaInsetos && (
                      <input
                        type="text"
                        value={form.fichaMedica.alergiaPicadaInsetosDetalhes}
                        onChange={e => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, alergiaPicadaInsetosDetalhes: e.target.value }
                        })}
                        placeholder="Detalhes da reação e medicamento de socorro..."
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                      />
                    )}
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-stone-800">
                      <input
                        type="checkbox"
                        checked={form.fichaMedica.alergiaMedicamentos}
                        onChange={e => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, alergiaMedicamentos: e.target.checked }
                        })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>Medicamentos (Dipirona, Penicilina, Anti-inflamatórios...)</span>
                    </label>
                    {form.fichaMedica.alergiaMedicamentos && (
                      <input
                        type="text"
                        value={form.fichaMedica.alergiaMedicamentosDetalhes}
                        onChange={e => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, alergiaMedicamentosDetalhes: e.target.value }
                        })}
                        placeholder="Quais medicamentos NÃO podem ser administrados..."
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                      />
                    )}
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-stone-800">
                      <input
                        type="checkbox"
                        checked={form.fichaMedica.alergiaAlimentos}
                        onChange={e => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, alergiaAlimentos: e.target.checked }
                        })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>Alimentos (Glúten, Lactose, Amendoim, Frutos do mar...)</span>
                    </label>
                    {form.fichaMedica.alergiaAlimentos && (
                      <input
                        type="text"
                        value={form.fichaMedica.alergiaAlimentosDetalhes}
                        onChange={e => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, alergiaAlimentosDetalhes: e.target.value }
                        })}
                        placeholder="Descreva alimentos proibidos e conduta..."
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 6. Informações Gerais de Aptidão */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
              <h4 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
                6. Informações Gerais de Aptidão
              </h4>

              <div className="space-y-4">
                {/* Impedimento físico */}
                <div className="p-3 bg-stone-50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">
                      Possui algum impedimento físico para atividades ao ar livre?
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, impedidoAtividadesArLivre: false }
                        })}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                          !form.fichaMedica.impedidoAtividadesArLivre ? 'bg-stone-800 text-white' : 'bg-white text-stone-700'
                        }`}
                      >
                        ( ) Não
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, impedidoAtividadesArLivre: true }
                        })}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                          form.fichaMedica.impedidoAtividadesArLivre ? 'bg-amber-600 text-white' : 'bg-white text-stone-700'
                        }`}
                      >
                        ( X ) Sim
                      </button>
                    </div>
                  </div>
                  {form.fichaMedica.impedidoAtividadesArLivre && (
                    <input
                      type="text"
                      value={form.fichaMedica.impedidoAtividadesDetalhes}
                      onChange={e => setForm({
                        ...form,
                        fichaMedica: { ...form.fichaMedica, impedidoAtividadesDetalhes: e.target.value }
                      })}
                      placeholder="Especificar impedimento físico..."
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                    />
                  )}
                </div>

                {/* Restrições alimentares */}
                <div className="p-3 bg-stone-50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">
                      Apresenta restrições alimentares específicas?
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, restricoesAlimentares: false }
                        })}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                          !form.fichaMedica.restricoesAlimentares ? 'bg-stone-800 text-white' : 'bg-white text-stone-700'
                        }`}
                      >
                        ( ) Não
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, restricoesAlimentares: true }
                        })}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                          form.fichaMedica.restricoesAlimentares ? 'bg-amber-600 text-white' : 'bg-white text-stone-700'
                        }`}
                      >
                        ( X ) Sim
                      </button>
                    </div>
                  </div>
                  {form.fichaMedica.restricoesAlimentares && (
                    <input
                      type="text"
                      value={form.fichaMedica.restricoesAlimentaresDetalhes}
                      onChange={e => setForm({
                        ...form,
                        fichaMedica: { ...form.fichaMedica, restricoesAlimentaresDetalhes: e.target.value }
                      })}
                      placeholder="Especificar restrições alimentares..."
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                    />
                  )}
                </div>

                {/* Cardiopatias */}
                <div className="p-3 bg-stone-50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">
                      Apresenta cardiopatias ou problemas cardíacos?
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, cardiopatias: false }
                        })}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                          !form.fichaMedica.cardiopatias ? 'bg-stone-800 text-white' : 'bg-white text-stone-700'
                        }`}
                      >
                        ( ) Não
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, cardiopatias: true }
                        })}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                          form.fichaMedica.cardiopatias ? 'bg-rose-600 text-white' : 'bg-white text-stone-700'
                        }`}
                      >
                        ( X ) Sim
                      </button>
                    </div>
                  </div>
                  {form.fichaMedica.cardiopatias && (
                    <input
                      type="text"
                      value={form.fichaMedica.cardiopatiasDetalhes}
                      onChange={e => setForm({
                        ...form,
                        fichaMedica: { ...form.fichaMedica, cardiopatiasDetalhes: e.target.value }
                      })}
                      placeholder="Especificar problemas cardíacos..."
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                    />
                  )}
                </div>

                {/* Sabe nadar & Sonambulismo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">Sabe nadar?</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, sabeNadar: false }
                        })}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                          !form.fichaMedica.sabeNadar ? 'bg-amber-600 text-white' : 'bg-white text-stone-700'
                        }`}
                      >
                        ( ) Não
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, sabeNadar: true }
                        })}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                          form.fichaMedica.sabeNadar ? 'bg-cyan-700 text-white' : 'bg-white text-stone-700'
                        }`}
                      >
                        ( X ) Sim
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">Apresenta histórico de sonambulismo?</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, historicoSonambulismo: false }
                        })}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                          !form.fichaMedica.historicoSonambulismo ? 'bg-stone-800 text-white' : 'bg-white text-stone-700'
                        }`}
                      >
                        ( ) Não
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, historicoSonambulismo: true }
                        })}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                          form.fichaMedica.historicoSonambulismo ? 'bg-amber-600 text-white' : 'bg-white text-stone-700'
                        }`}
                      >
                        ( X ) Sim
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 7. Saúde Mental e Transtornos Psicológicos */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
              <h4 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
                7. Saúde Mental e Transtornos Psicológicos
              </h4>

              <div className="space-y-3">
                {/* Transtorno de Comportamento */}
                <div className="p-3 bg-stone-50 rounded-xl space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-stone-800">
                      Apresenta Transtorno de Comportamento? <span className="font-normal text-stone-500">(Ex.: conduta, oposição desafiante, etc.)</span>
                    </span>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, transtornoComportamento: false }
                        })}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                          !form.fichaMedica.transtornoComportamento ? 'bg-stone-800 text-white' : 'bg-white text-stone-700'
                        }`}
                      >
                        ( ) Não
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, transtornoComportamento: true }
                        })}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                          form.fichaMedica.transtornoComportamento ? 'bg-amber-600 text-white' : 'bg-white text-stone-700'
                        }`}
                      >
                        ( X ) Sim
                      </button>
                    </div>
                  </div>
                  {form.fichaMedica.transtornoComportamento && (
                    <input
                      type="text"
                      value={form.fichaMedica.transtornoComportamentoDetalhes}
                      onChange={e => setForm({
                        ...form,
                        fichaMedica: { ...form.fichaMedica, transtornoComportamentoDetalhes: e.target.value }
                      })}
                      placeholder="Cite: detalhes do transtorno de comportamento..."
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                    />
                  )}
                </div>

                {/* Transtorno Alimentar */}
                <div className="p-3 bg-stone-50 rounded-xl space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-stone-800">
                      Apresenta Transtorno Alimentar? <span className="font-normal text-stone-500">(Ex.: anorexia, bulimia, etc.)</span>
                    </span>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, transtornoAlimentar: false }
                        })}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                          !form.fichaMedica.transtornoAlimentar ? 'bg-stone-800 text-white' : 'bg-white text-stone-700'
                        }`}
                      >
                        ( ) Não
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, transtornoAlimentar: true }
                        })}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                          form.fichaMedica.transtornoAlimentar ? 'bg-amber-600 text-white' : 'bg-white text-stone-700'
                        }`}
                      >
                        ( X ) Sim
                      </button>
                    </div>
                  </div>
                  {form.fichaMedica.transtornoAlimentar && (
                    <input
                      type="text"
                      value={form.fichaMedica.transtornoAlimentarDetalhes}
                      onChange={e => setForm({
                        ...form,
                        fichaMedica: { ...form.fichaMedica, transtornoAlimentarDetalhes: e.target.value }
                      })}
                      placeholder="Cite: detalhes do transtorno alimentar..."
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                    />
                  )}
                </div>

                {/* Transtorno de Ansiedade ou Fobia */}
                <div className="p-3 bg-stone-50 rounded-xl space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-stone-800">
                      Apresenta Transtorno de Ansiedade ou Fobia? <span className="font-normal text-stone-500">(Ex.: síndrome do pânico, fobia social, etc.)</span>
                    </span>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, transtornoAnsiedadeFobia: false }
                        })}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                          !form.fichaMedica.transtornoAnsiedadeFobia ? 'bg-stone-800 text-white' : 'bg-white text-stone-700'
                        }`}
                      >
                        ( ) Não
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, transtornoAnsiedadeFobia: true }
                        })}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                          form.fichaMedica.transtornoAnsiedadeFobia ? 'bg-amber-600 text-white' : 'bg-white text-stone-700'
                        }`}
                      >
                        ( X ) Sim
                      </button>
                    </div>
                  </div>
                  {form.fichaMedica.transtornoAnsiedadeFobia && (
                    <input
                      type="text"
                      value={form.fichaMedica.transtornoAnsiedadeFobiaDetalhes}
                      onChange={e => setForm({
                        ...form,
                        fichaMedica: { ...form.fichaMedica, transtornoAnsiedadeFobiaDetalhes: e.target.value }
                      })}
                      placeholder="Cite: detalhes de ansiedade ou fobia..."
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                    />
                  )}
                </div>

              </div>
            </div>

            {/* 8. Pessoas com Deficiência (PCD) */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h4 className="text-base font-bold text-stone-900">
                  8. Pessoas com Deficiência (PCD)
                </h4>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setForm({
                      ...form,
                      fichaMedica: { ...form.fichaMedica, apresentaDeficiencia: false }
                    })}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                      !form.fichaMedica.apresentaDeficiencia ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    ( ) Não
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({
                      ...form,
                      fichaMedica: { ...form.fichaMedica, apresentaDeficiencia: true }
                    })}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                      form.fichaMedica.apresentaDeficiencia ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    ( X ) Sim
                  </button>
                </div>
              </div>

              {form.fichaMedica.apresentaDeficiencia && (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-stone-500">
                    Selecione o(s) tipo(s) de deficiência comprovada e especifique os detalhes:
                  </p>

                  {/* Física */}
                  <div className="p-3 bg-stone-50 rounded-xl space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-stone-800">
                      <input
                        type="checkbox"
                        checked={form.fichaMedica.deficienciaFisica}
                        onChange={e => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, deficienciaFisica: e.target.checked }
                        })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>( ) Física — Especificar:</span>
                    </label>
                    {form.fichaMedica.deficienciaFisica && (
                      <input
                        type="text"
                        value={form.fichaMedica.deficienciaFisicaDetalhes}
                        onChange={e => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, deficienciaFisicaDetalhes: e.target.value }
                        })}
                        placeholder="Especificar deficiência física e necessidades de locomoção..."
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                      />
                    )}
                  </div>

                  {/* Visual */}
                  <div className="p-3 bg-stone-50 rounded-xl space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-stone-800">
                      <input
                        type="checkbox"
                        checked={form.fichaMedica.deficienciaVisual}
                        onChange={e => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, deficienciaVisual: e.target.checked }
                        })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>( ) Visual — Especificar:</span>
                    </label>
                    {form.fichaMedica.deficienciaVisual && (
                      <input
                        type="text"
                        value={form.fichaMedica.deficienciaVisualDetalhes}
                        onChange={e => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, deficienciaVisualDetalhes: e.target.value }
                        })}
                        placeholder="Especificar baixa visão, cegueira, etc..."
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                      />
                    )}
                  </div>

                  {/* Auditiva */}
                  <div className="p-3 bg-stone-50 rounded-xl space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-stone-800">
                      <input
                        type="checkbox"
                        checked={form.fichaMedica.deficienciaAuditiva}
                        onChange={e => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, deficienciaAuditiva: e.target.checked }
                        })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>( ) Auditiva — Especificar:</span>
                    </label>
                    {form.fichaMedica.deficienciaAuditiva && (
                      <input
                        type="text"
                        value={form.fichaMedica.deficienciaAuditivaDetalhes}
                        onChange={e => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, deficienciaAuditivaDetalhes: e.target.value }
                        })}
                        placeholder="Especificar perda auditiva, uso de aparelho, etc..."
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                      />
                    )}
                  </div>

                  {/* Intelectual */}
                  <div className="p-3 bg-stone-50 rounded-xl space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-stone-800">
                      <input
                        type="checkbox"
                        checked={form.fichaMedica.deficienciaIntelectual}
                        onChange={e => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, deficienciaIntelectual: e.target.checked }
                        })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>( ) Intelectual — Especificar:</span>
                    </label>
                    {form.fichaMedica.deficienciaIntelectual && (
                      <input
                        type="text"
                        value={form.fichaMedica.deficienciaIntelectualDetalhes}
                        onChange={e => setForm({
                          ...form,
                          fichaMedica: { ...form.fichaMedica, deficienciaIntelectualDetalhes: e.target.value }
                        })}
                        placeholder="Especificar deficiência intelectual e suporte pedagógico..."
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                      />
                    )}
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* ETAPA 4: TERMOS, USO DE IMAGEM & FINALIZAÇÃO (PÁGINA 4) */}
        {/* ========================================================= */}
        {etapa === 4 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
                <FileCheck className="w-4 h-4" />
                <span>Página 4 da Ficha Oficial</span>
              </div>
              <h3 className="text-xl font-bold font-serif text-stone-900">
                Autorização do Uso de Imagem e Termo de Compromisso
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Grupo Escoteiro Tradicional 22 de Fevereiro • Rua Marcos Granzotti, nº 4725, Jardim Paineiras, Franca/SP
              </p>
            </div>

            {/* Texto integral oficial */}
            <div className="p-4 sm:p-5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-700 space-y-3 leading-relaxed max-h-60 overflow-y-auto">
              <p>
                <strong>1. Autorização de Uso de Imagem e Voz:</strong> Como responsável pela inscrição neste documento, 
                autorizo o <em>Grupo Escoteiro Tradicional 22 de Fevereiro</em>, com sede na Rua Marcos Granzotti, nº 4725, 
                Jardim Paineiras, Franca, SP, CEP 14.409-403, a utilizar-se das imagens e voz minha, ou daquele que represento 
                ou assisto, para a edição de filmes e fotos, outorgando-lhe todos os direitos de imagem relacionados, 
                para qualquer tipo de divulgação, publicidade e veiculação em todos e quaisquer meios de comunicação, 
                para finalidade editorial, comercial, promocional, educacional, institucional e publicitária.
              </p>
              <p>
                <strong>2. Regulamento e Veracidade Médica:</strong> Os associados beneficiários e contribuintes declaram 
                que conhecem e concordam em cumprir a regulamentação interna do Grupo Escoteiro Tradicional 22 de Fevereiro. 
                Declaro que as informações acima foram por mim prestadas e são de minha inteira e total responsabilidade, 
                especialmente o conteúdo e especificações descritos na ficha médica.
              </p>
              <p>
                <strong>3. Colaboração Mensal e Responsabilidade Civil:</strong> Também estou ciente do compromisso de efetuar 
                o pagamento da colaboração mensal definida pelo Grupo Escoteiro Tradicional 22 de Fevereiro, bem como em reembolsar 
                o Grupo Escoteiro por eventuais danos materiais ou financeiros causados pelo(a) jovem inscrito(a) sob minha responsabilidade.
              </p>
            </div>

            {/* Checkboxes formais de concordância */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <input
                  type="checkbox"
                  required
                  checked={form.autorizacaoImagem}
                  onChange={e => setForm({ ...form, autorizacaoImagem: e.target.checked })}
                  className="w-4 h-4 text-emerald-700 rounded mt-0.5 focus:ring-emerald-600"
                />
                <span className="text-xs sm:text-sm font-medium text-stone-800">
                  Autorizo o uso de imagem e voz para fins institucionais e atividades escoteiras.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <input
                  type="checkbox"
                  required
                  checked={form.concordanciaRegulamento}
                  onChange={e => setForm({ ...form, concordanciaRegulamento: e.target.checked })}
                  className="w-4 h-4 text-emerald-700 rounded mt-0.5 focus:ring-emerald-600"
                />
                <span className="text-xs sm:text-sm font-medium text-stone-800">
                  Declaro haver lido as informações acima e concordo com os termos e regulamento interno.
                </span>
              </label>
            </div>

            {/* Assinatura do Responsável e Data */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-4 border-t border-stone-100">
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Nome do Responsável que Assina *
                </label>
                <input
                  type="text"
                  required
                  value={form.responsavelAssinatura}
                  onChange={e => setForm({ ...form, responsavelAssinatura: e.target.value })}
                  placeholder="Nome por extenso do responsável"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  CPF do Responsável *
                </label>
                <input
                  type="text"
                  required
                  value={form.cpfAssinatura}
                  onChange={e => setForm({ ...form, cpfAssinatura: formatarCPF(e.target.value) })}
                  placeholder="000.000.000-00"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Data da Declaração
                </label>
                <input
                  type="date"
                  value={form.dataAssinatura}
                  onChange={e => setForm({ ...form, dataAssinatura: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation & Submit Bar */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center">
            {etapa > 1 ? (
              <button
                type="button"
                onClick={() => setEtapa(etapa - 1)}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-semibold text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Etapa Anterior</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-stone-500 hover:text-stone-800 text-center"
              >
                Cancelar
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {etapa < 4 ? (
              <button
                type="button"
                onClick={() => setEtapa(etapa + 1)}
                className="w-full sm:w-auto px-6 py-3.5 sm:py-2.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Próxima Etapa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={salvando}
                className="w-full sm:w-auto px-6 py-3.5 sm:py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-emerald-950 text-sm font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-emerald-950 stroke-[2.5]" />
                <span>{salvando ? 'Gravando no Banco...' : initialData ? 'Salvar Alterações' : 'Concluir Cadastro no Banco'}</span>
              </button>
            )}
          </div>
        </div>

      </form>

      {/* Modal de Captura com Webcam */}
      {modalWebcamAberta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-stone-900 font-bold">
                <Camera className="w-5 h-5 text-emerald-700" />
                <span>Capturar Foto 3x4 pela Webcam</span>
              </div>
              <button
                type="button"
                onClick={pararWebcam}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] max-h-80 mx-auto flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Moldura guia para centralização do rosto */}
              <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-amber-400/70 rounded-2xl m-3 flex items-center justify-center">
                <span className="text-[10px] text-white/70 bg-black/50 px-2 py-0.5 rounded-full mb-auto mt-2">
                  Enquadre o rosto no centro
                </span>
              </div>
            </div>

            <p className="text-center text-xs text-stone-500">
              Posicione o rosto do escoteiro centralizado e clique no botão abaixo.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={capturarFotoWebcam}
                className="flex-1 py-3 px-4 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Fotografar Agora</span>
              </button>
              <button
                type="button"
                onClick={pararWebcam}
                className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
