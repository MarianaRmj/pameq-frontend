"use client";

import { useEffect, useState } from "react";
import { useConfirm } from "@/hooks/useConfirm";
import { InstitutionForm, CicloForm } from "./types";

export const useEditarInstitucion = () => {
  const { confirm, ConfirmModal } = useConfirm();
  const [formDataOriginal, setFormDataOriginal] =
    useState<InstitutionForm | null>(null);

  const [formData, setFormData] = useState<InstitutionForm>({
    nombre_ips: "",
    nit: "",
    direccion_principal: "",
    telefono: "",
    codigo_habilitacion: "",
    tipo_institucion: "",
    nombre_representante: "",
    nivel_complejidad: "",
    correo_contacto: "",
    enfoque: "",
  });

  const [sedes, setSedes] = useState<{ id: number; nombre_sede: string }[]>([]);
  const [ciclos, setCiclos] = useState<CicloForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [alerta, setAlerta] = useState<null | {
    tipo: "success" | "error";
    mensaje: string;
  }>(null);
  const pageSize = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(ciclos.length / pageSize);

  const ciclosPaginados = ciclos.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    fetch("http://localhost:3001/sedes")
      .then((res) => res.json())
      .then((data) => setSedes(data))
      .catch((err) => console.error("Error cargando sedes", err));
  }, []);

  useEffect(() => {
    const fetchInstitucion = async () => {
      try {
        const res = await fetch("http://localhost:3001/institutions/1");
        const data = await res.json();
        setFormData(data);
        setFormDataOriginal(data);

        const ciclosConId = (data.ciclos || [])
          .map((c: Partial<CicloForm>) => ({
            ...c,
            institutionId: data.id,
          }))
          .sort(
            (
              a: { fecha_inicio: string | number | Date },
              b: { fecha_inicio: string | number | Date }
            ) =>
              new Date(b.fecha_inicio).getTime() -
              new Date(a.fecha_inicio).getTime()
          );

        setCiclos(ciclosConId);
        setLoading(false);
      } catch (err) {
        console.error("Error cargando institución", err);
      }
    };

    fetchInstitucion();
  }, []);

  const isFormChanged = () => {
    if (!formDataOriginal) return false;

    return Object.keys(formData).some((key) => {
      const k = key as keyof InstitutionForm;
      return formData[k] !== formDataOriginal[k];
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addCiclo = () => {
    const hayCicloNuevoIncompleto = ciclos.some(
      (c) =>
        !c.id &&
        (!c.fecha_inicio.trim() ||
          !c.fecha_fin.trim() ||
          !c.enfoque.trim() ||
          !c.sedeId)
    );

    if (hayCicloNuevoIncompleto) {
      setAlerta({
        tipo: "error",
        mensaje: "❌ Complete el ciclo nuevo anterior antes de agregar otro.",
      });
      return;
    }

    const nuevoCiclo: CicloForm = {
      fecha_inicio: "",
      fecha_fin: "",
      enfoque: "",
      sedeId: undefined,
      estado: "activo",
      observaciones: "",
      institutionId: Number(formData.id),
    };

    setCiclos((prev) => [...prev, nuevoCiclo]);
  };

  const updateCiclo = <K extends keyof CicloForm>(
    index: number,
    field: K,
    value: CicloForm[K]
  ) => {
    setCiclos((prev) => {
      const nuevos = [...prev];
      nuevos[index] = {
        ...nuevos[index],
        [field]: value,
      };
      return nuevos;
    });
  };

  const saveCiclo = async (index: number) => {
    const ciclo = ciclos[index];

    const esNuevo = !ciclo.id;

    const camposIncompletos =
      !ciclo.fecha_inicio?.trim() ||
      !ciclo.fecha_fin?.trim() ||
      !ciclo.enfoque?.trim() ||
      !ciclo.sedeId ||
      !ciclo.institutionId;

    if (esNuevo && camposIncompletos) {
      setAlerta({
        tipo: "error",
        mensaje:
          "❌ Complete todos los campos del nuevo ciclo antes de guardar.",
      });
      return;
    }

    confirm("¿Está seguro de guardar ✅ este ciclo?", async () => {
      try {
        const payload = {
          fecha_inicio: ciclo.fecha_inicio,
          fecha_fin: ciclo.fecha_fin,
          enfoque: ciclo.enfoque,
          sedeId:
            ciclo.sedeId !== undefined && !Number.isNaN(Number(ciclo.sedeId))
              ? Number(ciclo.sedeId)
              : ciclo.sede?.id,
          estado: ciclo.estado,
          observaciones: ciclo.observaciones,
          institutionId: ciclo.institutionId,
        };

        let response;
        if (ciclo.id) {
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/cycles/${ciclo.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            }
          );
        } else {
          response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cycles`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
        }

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Error al guardar");

        setAlerta({
          tipo: "success",
          mensaje: ciclo.id
            ? "Ciclo actualizado correctamente"
            : "Ciclo creado correctamente",
        });
      } catch (error) {
        setAlerta({
          tipo: "error",
          mensaje: `❌ Error: ${(error as Error).message}`,
        });
      }
    });
  };

  const eliminarCiclo = (index: number) => {
    confirm("¿Está seguro de eliminar ✖️ este ciclo?", () => {
      setCiclos((prev) => prev.filter((_, i) => i !== index));
      setAlerta({
        tipo: "success",
        mensaje: "Ciclo eliminado correctamente.",
      });
    });
  };

  const handleSubmitInstitucion = async (e: React.FormEvent) => {
    e.preventDefault();

    confirm(
      "¿Está seguro de guardar los cambios de la institución?",
      async () => {
        setGuardando(true);
        try {
          const res = await fetch("http://localhost:3001/institutions/1", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });

          if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || "Error actualizando institución");
          }

          setAlerta({
            tipo: "success",
            mensaje: "✅ Institución actualizada correctamente.",
          });

          window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
          console.error(err);
          setAlerta({ tipo: "error", mensaje: `❌ ${err}` });
        } finally {
          setGuardando(false);
        }
      }
    );
  };

  return {
    formData,
    setFormData,
    sedes,
    ciclos,
    setCiclos,
    loading,
    guardando,
    setGuardando,
    alerta,
    setAlerta,
    confirm,
    ConfirmModal,
    handleChange,
    addCiclo,
    updateCiclo,
    saveCiclo,
    eliminarCiclo,
    handleSubmitInstitucion,
    isFormChanged,
    ciclosPaginados,
    currentPage,
    setCurrentPage,
    totalPages,
  };
};
