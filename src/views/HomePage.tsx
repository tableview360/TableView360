import ReservationsList from '../components/ReservationsList';

const HomePage = () => {
  return (
    <>
      <section className="max-w-7xl mx-auto py-16 px-6 text-center">
        <h1 className="text-[3.5rem] font-bold mb-6 bg-gradient-to-br from-slate-50 to-slate-300 bg-clip-text text-transparent">
          Bienvenido a TableView360
        </h1>
        <p className="text-xl text-slate-400 max-w-[600px] mx-auto">
          La mejor plataforma para visualizar tus datos en 360°
        </p>
      </section>

      <ReservationsList />
    </>
  );
};

export default HomePage;
