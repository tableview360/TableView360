import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useTranslation } from 'react-i18next';

const ContactForm = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'sending' | 'success' | 'error'
  >('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setStatus('error');
      return;
    }

    setStatus('sending');
    const { error } = await supabase
      .from('contacts')
      .insert([{ name, email, message }]);
    if (error) {
      console.error(error);
      setStatus('error');
      return;
    }

    setStatus('success');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-slate-800 p-8 rounded-3xl shadow-xl space-y-6"
    >
      <h2 className="text-2xl font-bold text-white text-center mb-6">
        {t('Send us a message')}
      </h2>

      <input
        type="text"
        placeholder={t('Your Name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <input
        type="email"
        placeholder={t('Your Email')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <textarea
        placeholder={t('Your Message')}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-32"
      />

      <button
        type="submit"
        className="w-full cursor-pointer py-3 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl text-white font-semibold text-lg shadow-lg hover:shadow-indigo-500/50 transition-all duration-300"
        disabled={status === 'sending'}
      >
        {status === 'sending' ? t('Sending...') : t('Send Message')}
      </button>

      {status === 'success' && (
        <p className="text-emerald-400 text-center mt-2">
          {t('Message sent successfully!')}
        </p>
      )}
      {status === 'error' && (
        <p className="text-red-400 text-center mt-2">
          {t('Please fill all fields correctly.')}
        </p>
      )}
    </form>
  );
};

export default ContactForm;
