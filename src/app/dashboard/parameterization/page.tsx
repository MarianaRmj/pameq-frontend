'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditarInstitucion() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre_ips: '',
    nit: '',
    direccion_principal: '',
    telefono: '',
    codigo_habilitacion: '',
    tipo_institucion: '',
    nombre_representante: '',
    nivel_complejidad: '',
    correo_contacto: '',
    sitio_web: '',
    resolucion_habilitacion: '',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/institutions/1')
      .then((res) => res.json())
      .then((data) => {
        setFormData(data);
        setLoading(false);
      })
      .catch(() => {
        alert('Error cargando la institución');
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3001/institutions/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Error al actualizar');

      alert('✅ Institución actualizada');
      router.push('/dashboard');
    } catch (err) {
      alert(`❌ ${err}`);
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: '#555' }}>Cargando datos...</div>;

  return (
    <div style={{
      maxWidth: '960px',
      margin: '60px auto',
      padding: '40px',
      backgroundColor: '#f2f2f2',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      fontFamily: 'Nunito, sans-serif'
    }}>
      <h2 style={{
        fontSize: '28px',
        color: '#2C5959',
        fontWeight: 700,
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        Parametrizar Institución
      </h2>

      <form onSubmit={handleSubmit} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {[
          { label: 'Nombre de la IPS', name: 'nombre_ips' },
          { label: 'NIT', name: 'nit' },
          { label: 'Dirección Principal', name: 'direccion_principal' },
          { label: 'Teléfono', name: 'telefono' },
          { label: 'Código de Habilitación', name: 'codigo_habilitacion' },
          { label: 'Representante Legal', name: 'nombre_representante' },
          { label: 'Correo de Contacto', name: 'correo_contacto' },
        ].map((field) => (
          <div key={field.name} style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '6px', fontWeight: 600, color: '#171717' }}>{field.label}</label>
            <input
              name={field.name}
              value={formData[field.name as keyof typeof formData] || ''}
              onChange={handleChange}
              required={['nombre_ips', 'nit', 'direccion_principal'].includes(field.name)}
              style={{
                padding: '10px 14px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                backgroundColor: '#fff',
                fontSize: '14px'
              }}
            />
          </div>
        ))}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '6px', fontWeight: 600, color: '#171717' }}>Tipo de Institución</label>
          <select
            name="tipo_institucion"
            value={formData.tipo_institucion}
            onChange={handleChange}
            style={{
              padding: '10px 14px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              backgroundColor: '#fff',
              fontSize: '14px'
            }}
          >
            <option value="">Seleccione</option>
            <option value="Publica">Publica</option>
            <option value="Privada">Privada</option>
            <option value="Mixta">Mixta</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '6px', fontWeight: 600, color: '#171717' }}>Nivel de Complejidad</label>
          <select
            name="nivel_complejidad"
            value={formData.nivel_complejidad}
            onChange={handleChange}
            style={{
              padding: '10px 14px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              backgroundColor: '#fff',
              fontSize: '14px'
            }}
          >
            <option value="">Seleccione</option>
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
          </select>
        </div>

        <div style={{
          gridColumn: '1 / -1',
          textAlign: 'right',
          marginTop: '20px'
        }}>
          <button
            type="submit"
            style={{
              backgroundColor: '#2C5959',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Actualizar
          </button>
        </div>
      </form>
    </div>
  );
}
