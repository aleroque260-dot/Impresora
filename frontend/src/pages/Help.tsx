// src/pages/Help.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Video,
  BookOpen,
  Users,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertCircle,
  Info
} from 'lucide-react';

const Help: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqs = [
    {
      id: 1,
      question: '¿Qué tipos de archivos puedo subir para imprimir?',
      answer: 'Aceptamos archivos STL, OBJ, GCODE y 3MF. El tamaño máximo es de 100MB por archivo.'
    },
    {
      id: 2,
      question: '¿Cuánto tiempo tarda en revisarse mi trabajo?',
      answer: 'El tiempo de revisión es de 24-48 horas hábiles. Los trabajos urgentes pueden tener prioridad.'
    },
    {
      id: 3,
      question: '¿Cómo se calcula el costo de mis impresiones?',
      answer: 'Los costos se calculan en base al tiempo de impresión, material utilizado y complejidad del diseño.'
    },
    {
      id: 4,
      question: '¿Puedo cancelar un trabajo después de subirlo?',
      answer: 'Sí, puedes cancelar trabajos en estado "Pendiente" o "En revisión" desde la página de Trabajos Pendientes.'
    },
    {
      id: 5,
      question: '¿Dónde puedo recoger mis impresiones terminadas?',
      answer: 'Las impresiones están disponibles para recoger en el laboratorio de impresión 3D. Recibirás una notificación cuando estén listas.'
    },
    {
      id: 6,
      question: '¿Qué materiales de impresión están disponibles?',
      answer: 'Contamos con PLA, ABS, PETG, TPU (flexible) y Nylon. El material se selecciona según las necesidades de tu diseño.'
    }
  ];

  const tutorials = [
    {
      title: 'Preparación de archivos STL',
      description: 'Aprende a preparar correctamente tus archivos para impresión 3D',
      duration: '15 min',
      type: 'video'
    },
    {
      title: 'Optimización de diseños',
      description: 'Consejos para reducir tiempo y material en tus impresiones',
      duration: '10 min',
      type: 'article'
    },
    {
      title: 'Introducción al modelado 3D',
      description: 'Guía básica para comenzar con el diseño 3D',
      duration: '30 min',
      type: 'course'
    },
    {
      title: 'Solución de problemas comunes',
      description: 'Resuelve errores frecuentes en la impresión 3D',
      duration: '20 min',
      type: 'guide'
    }
  ];

  const handleFaqToggle = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Mensaje enviado. Te contactaremos pronto.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Centro de Ayuda</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Encuentra respuestas a tus preguntas, tutoriales y soporte personalizado
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <HelpCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Preguntas Frecuentes</h3>
          <p className="text-gray-600 text-sm">Respuestas a las dudas más comunes</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Tutoriales</h3>
          <p className="text-gray-600 text-sm">Guías paso a paso y videos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Soporte Personal</h3>
          <p className="text-gray-600 text-sm">Ayuda directa de nuestro equipo</p>
        </div>
      </div>

      {/* Preguntas Frecuentes */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <HelpCircle className="h-6 w-6 text-blue-600 mr-3" />
            Preguntas Frecuentes (FAQ)
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {faqs.map(faq => (
            <div key={faq.id} className="p-6">
              <button
                onClick={() => handleFaqToggle(faq.id)}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
                    <span className="font-medium">{faq.id}</span>
                  </div>
                  <h3 className="font-medium text-gray-900">{faq.question}</h3>
                </div>
                {openFaq === faq.id ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              
              {openFaq === faq.id && (
                <div className="mt-4 pl-12">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tutoriales y Recursos */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <BookOpen className="h-6 w-6 text-green-600 mr-3" />
          Tutoriales y Recursos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tutorials.map((tutorial, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">{tutorial.title}</h3>
                  <p className="text-sm text-gray-600">{tutorial.description}</p>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-500">{tutorial.duration}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {tutorial.type === 'video' && <Video className="h-4 w-4 text-red-500 mr-2" />}
                  {tutorial.type === 'article' && <FileText className="h-4 w-4 text-blue-500 mr-2" />}
                  {tutorial.type === 'course' && <BookOpen className="h-4 w-4 text-green-500 mr-2" />}
                  {tutorial.type === 'guide' && <Info className="h-4 w-4 text-purple-500 mr-2" />}
                  <span className="text-sm text-gray-600 capitalize">{tutorial.type}</span>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                  Ver más
                  <ExternalLink className="h-3 w-3 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario de Contacto */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MessageSquare className="h-6 w-6 text-purple-600 mr-3" />
              Contactar Soporte
            </h2>
            
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tu nombre"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Asunto *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleContactChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona un asunto</option>
                  <option value="technical">Problema técnico</option>
                  <option value="billing">Consulta de costos</option>
                  <option value="upload">Problema al subir archivo</option>
                  <option value="status">Consulta de estado</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={contactForm.message}
                  onChange={handleContactChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe detalladamente tu consulta o problema..."
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                  Acepto los términos y condiciones del servicio
                </label>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                  Enviar Mensaje
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div>
          <div className="space-y-6">
            {/* Información de contacto */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="h-5 w-5 text-blue-600 mr-2" />
                Contacto Directo
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Correo de Soporte</p>
                  <a href="mailto:soporte@print3dschool.edu" className="text-blue-600 hover:text-blue-800">
                    soporte@print3dschool.edu
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Teléfono</p>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Horario de Atención</p>
                  <p className="text-gray-600">Lunes a Viernes: 8:00 - 18:00</p>
                  <p className="text-gray-600 text-sm">Sábados: 9:00 - 13:00</p>
                </div>
              </div>
            </div>
            
            {/* Consejos rápidos */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                ¿Antes de Contactar?
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-blue-800">Revisa las preguntas frecuentes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-blue-800">Verifica el estado de tu trabajo</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-blue-800">Prepara información relevante</span>
                </li>
              </ul>
            </div>
            
            {/* Enlaces rápidos */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Enlaces Rápidos</h3>
              <div className="space-y-3">
                <Link to="/upload" className="block text-sm text-blue-600 hover:text-blue-800">
                  Subir nuevo trabajo
                </Link>
                <Link to="/dashboard" className="block text-sm text-blue-600 hover:text-blue-800">
                  Ver mi dashboard
                </Link>
                <Link to="/history" className="block text-sm text-blue-600 hover:text-blue-800">
                  Historial de impresiones
                </Link>
                <Link to="/profile" className="block text-sm text-blue-600 hover:text-blue-800">
                  Mi perfil y configuración
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nota final */}
      <div className="text-center text-sm text-gray-500">
        <p>¿No encontraste lo que buscabas? Estamos aquí para ayudarte.</p>
        <p className="mt-1">Tiempo promedio de respuesta: 2-4 horas hábiles.</p>
      </div>
    </div>
  );
};

export default Help;