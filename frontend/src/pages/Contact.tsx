// src/pages/Contact.tsx
import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  User,
  MessageSquare,
  Building,
  ExternalLink
} from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const departments = [
    { id: 'support', name: 'Soporte Técnico', email: 'soporte@print3dschool.edu' },
    { id: 'billing', name: 'Facturación y Costos', email: 'facturacion@print3dschool.edu' },
    { id: 'admin', name: 'Administración', email: 'admin@print3dschool.edu' },
    { id: 'maintenance', name: 'Mantenimiento', email: 'mantenimiento@print3dschool.edu' },
    { id: 'academic', name: 'Académico', email: 'academico@print3dschool.edu' },
    { id: 'other', name: 'Otro', email: 'contacto@print3dschool.edu' }
  ];

  const contactInfo = [
    {
      icon: <MapPin className="h-6 w-6 text-blue-600" />,
      title: 'Ubicación',
      details: ['Laboratorio de Impresión 3D', 'Edificio de Tecnología', 'Piso 3, Sala 305'],
      link: 'https://maps.google.com',
      linkText: 'Ver en Google Maps'
    },
    {
      icon: <Phone className="h-6 w-6 text-green-600" />,
      title: 'Teléfonos',
      details: ['Soporte: +1 (555) 123-4567', 'Administración: +1 (555) 123-4568', 'Emergencias: +1 (555) 123-4569'],
      link: 'tel:+15551234567',
      linkText: 'Llamar ahora'
    },
    {
      icon: <Clock className="h-6 w-6 text-purple-600" />,
      title: 'Horarios',
      details: ['Lunes a Viernes: 8:00 - 18:00', 'Sábados: 9:00 - 13:00', 'Domingos: Cerrado'],
      link: null,
      linkText: ''
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        department: '',
        subject: '',
        message: ''
      });
      
      // Ocultar éxito después de 5 segundos
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      setSubmitError('Error al enviar el mensaje. Por favor, inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDept = departments.find(dept => dept.id === formData.department);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Contacto</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          ¿Necesitas ayuda? Estamos aquí para asistirte. Encuentra la mejor forma de contactarnos.
        </p>
      </div>

      {/* Información de contacto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contactInfo.map((info, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              {info.icon}
              <h3 className="font-semibold text-gray-900 ml-3">{info.title}</h3>
            </div>
            <div className="space-y-2">
              {info.details.map((detail, idx) => (
                <p key={idx} className="text-gray-700">{detail}</p>
              ))}
            </div>
            {info.link && (
              <a
                href={info.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mt-4"
              >
                {info.linkText}
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Formulario de contacto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <MessageSquare className="h-6 w-6 text-blue-600 mr-3" />
            Envíanos un Mensaje
          </h2>
          
          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-green-700 font-medium">¡Mensaje enviado exitosamente!</p>
              </div>
              <p className="text-green-600 text-sm mt-1">
                Te contactaremos en las próximas 24 horas hábiles.
              </p>
            </div>
          )}

          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-700">{submitError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1 text-gray-400" />
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tu nombre"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-1 text-gray-400" />
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tu@email.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="h-4 w-4 inline mr-1 text-gray-400" />
                Departamento *
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona un departamento</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            
            {selectedDept && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Este mensaje será enviado a: <span className="font-medium">{selectedDept.email}</span>
                </p>
              </div>
            )}
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Asunto *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="¿Cómo podemos ayudarte?"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje *
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe detalladamente tu consulta, problema o sugerencia..."
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="privacy"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="privacy" className="ml-2 text-sm text-gray-700">
                Acepto la política de privacidad y el tratamiento de mis datos
              </label>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Mensaje
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          {/* Departamento seleccionado */}
          {selectedDept && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Departamento Seleccionado</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedDept.name}</p>
                    <p className="text-sm text-gray-600">{selectedDept.email}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    El equipo de {selectedDept.name} se especializa en:
                  </p>
                  <ul className="mt-2 space-y-1">
                    {selectedDept.id === 'support' && (
                      <>
                        <li className="text-sm text-gray-600">• Soporte técnico del sistema</li>
                        <li className="text-sm text-gray-600">• Problemas con subida de archivos</li>
                        <li className="text-sm text-gray-600">• Errores de impresión</li>
                      </>
                    )}
                    {selectedDept.id === 'billing' && (
                      <>
                        <li className="text-sm text-gray-600">• Consultas de costos</li>
                        <li className="text-sm text-gray-600">• Facturación y pagos</li>
                        <li className="text-sm text-gray-600">• Saldos y créditos</li>
                      </>
                    )}
                    {selectedDept.id === 'admin' && (
                      <>
                        <li className="text-sm text-gray-600">• Gestión de usuarios</li>
                        <li className="text-sm text-gray-600">• Permisos y acceso</li>
                        <li className="text-sm text-gray-600">• Configuración del sistema</li>
                      </>
                    )}
                    {selectedDept.id === 'maintenance' && (
                      <>
                        <li className="text-sm text-gray-600">• Mantenimiento de impresoras</li>
                        <li className="text-sm text-gray-600">• Problemas técnicos</li>
                        <li className="text-sm text-gray-600">• Calibración de equipos</li>
                      </>
                    )}
                    {selectedDept.id === 'academic' && (
                      <>
                        <li className="text-sm text-gray-600">• Asesoría académica</li>
                        <li className="text-sm text-gray-600">• Proyectos educativos</li>
                        <li className="text-sm text-gray-600">• Capacitaciones</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tiempo de respuesta */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-4">Tiempos de Respuesta</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">Soporte Urgente</span>
                <span className="text-sm font-medium text-blue-900">2-4 horas</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">Consultas Técnicas</span>
                <span className="text-sm font-medium text-blue-900">24 horas</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">Facturación</span>
                <span className="text-sm font-medium text-blue-900">48 horas</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">General</span>
                <span className="text-sm font-medium text-blue-900">72 horas</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-xs text-blue-700">
                * Los tiempos son hábiles (Lunes a Viernes, 8:00 - 18:00)
              </p>
            </div>
          </div>

          {/* Consejos para contactar */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Para una respuesta más rápida:</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Incluye tu número de estudiante o ID</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Especifica el número de trabajo si aplica</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Adjunta capturas de pantalla si hay errores</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Sé específico con el problema o consulta</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ rápida */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Preguntas Comunes de Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">¿Cómo sé si mi mensaje fue recibido?</p>
            <p className="text-sm text-gray-600">
              Recibirás un correo de confirmación automática al email que proporcionaste.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">¿Puedo enviar archivos adjuntos?</p>
            <p className="text-sm text-gray-600">
              Sí, después de enviar el formulario podrás adjuntar archivos en la respuesta que recibirás.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">¿Qué hago si es una emergencia?</p>
            <p className="text-sm text-gray-600">
              Para emergencias técnicas, llama al número de emergencias: +1 (555) 123-4569
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">¿Puedo contactar en persona?</p>
            <p className="text-sm text-gray-600">
              Sí, visita el Laboratorio de Impresión 3D en el Edificio de Tecnología, Piso 3.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;