interface Props {
  table: { id: string } | null;
  onClose: () => void;
}

export default function Modal({ table, onClose }: Props) {
    if (!table) return null;
    return (
      <div className="modal">
        <h2>Reservar {table.id}</h2>
        <button onClick={onClose}>Cerrar</button>
        <button onClick={() => console.log("Reservado!")}>Confirmar</button>
      </div>
    );
  }