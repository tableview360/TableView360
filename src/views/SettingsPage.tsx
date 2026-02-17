import SettingsForm from '../components/SettingsForm';

const SettingsPage = () => {
  return (
    <section className="max-w-7xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold text-white text-center mb-8">
        Account Settings
      </h1>
      <SettingsForm />
    </section>
  );
};

export default SettingsPage;
