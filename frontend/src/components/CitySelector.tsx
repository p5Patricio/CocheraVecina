"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  MapPin,
  Search,
  ChevronDown,
  Check,
  Plane,
  X,
  Sparkles,
} from "lucide-react";

export interface MexicanCity {
  city: string;
  state: string;
  isPopular?: boolean;
  isAirport?: boolean;
}

export const MEXICAN_CITIES: MexicanCity[] = [
  // Guanajuato (Bajío Core)
  { city: "León", state: "Guanajuato", isPopular: true },
  { city: "Silao / Aeropuerto BJX", state: "Guanajuato", isPopular: true, isAirport: true },
  { city: "Guanajuato Capital", state: "Guanajuato", isPopular: true },
  { city: "Irapuato", state: "Guanajuato", isPopular: true },
  { city: "Celaya", state: "Guanajuato", isPopular: true },
  { city: "San Miguel de Allende", state: "Guanajuato", isPopular: true },
  { city: "Salamanca", state: "Guanajuato" },
  { city: "Dolores Hidalgo", state: "Guanajuato" },
  { city: "San Francisco del Rincón", state: "Guanajuato" },

  // Ciudad de México (CDMX)
  { city: "Cuauhtémoc", state: "Ciudad de México", isPopular: true },
  { city: "Benito Juárez", state: "Ciudad de México", isPopular: true },
  { city: "Miguel Hidalgo", state: "Ciudad de México", isPopular: true },
  { city: "Coyoacán", state: "Ciudad de México", isPopular: true },
  { city: "Venustiano Carranza / AICM", state: "Ciudad de México", isPopular: true, isAirport: true },
  { city: "Álvaro Obregón", state: "Ciudad de México" },
  { city: "Cuajimalpa / Santa Fe", state: "Ciudad de México" },
  { city: "Tlalpan", state: "Ciudad de México" },
  { city: "Gustavo A. Madero", state: "Ciudad de México" },
  { city: "Iztapalapa", state: "Ciudad de México" },

  // Jalisco
  { city: "Guadalajara", state: "Jalisco", isPopular: true },
  { city: "Zapopan", state: "Jalisco", isPopular: true },
  { city: "Tlajomulco / Aeropuerto GDL", state: "Jalisco", isPopular: true, isAirport: true },
  { city: "Puerto Vallarta", state: "Jalisco", isPopular: true },
  { city: "San Pedro Tlaquepaque", state: "Jalisco" },
  { city: "Tonalá", state: "Jalisco" },
  { city: "Lagos de Moreno", state: "Jalisco" },

  // Nuevo León
  { city: "Monterrey", state: "Nuevo León", isPopular: true },
  { city: "San Pedro Garza García", state: "Nuevo León", isPopular: true },
  { city: "Apodaca / Aeropuerto MTY", state: "Nuevo León", isPopular: true, isAirport: true },
  { city: "San Nicolás de los Garza", state: "Nuevo León" },
  { city: "Guadalupe", state: "Nuevo León" },
  { city: "Santa Catarina", state: "Nuevo León" },

  // Querétaro
  { city: "Santiago de Querétaro", state: "Querétaro", isPopular: true },
  { city: "El Marqués / Aeropuerto QRO", state: "Querétaro", isPopular: true, isAirport: true },
  { city: "Corregidora", state: "Querétaro" },
  { city: "San Juan del Río", state: "Querétaro" },
  { city: "Tequisquiapan", state: "Querétaro" },

  // Estado de México
  { city: "Toluca", state: "Estado de México", isPopular: true },
  { city: "Zumpango / AIFA", state: "Estado de México", isPopular: true, isAirport: true },
  { city: "Naucalpan de Juárez", state: "Estado de México" },
  { city: "Tlalnepantla de Baz", state: "Estado de México" },
  { city: "Huixquilucan / Interlomas", state: "Estado de México" },
  { city: "Metepec", state: "Estado de México" },
  { city: "Cuautitlán Izcalli", state: "Estado de México" },

  // Puebla
  { city: "Puebla", state: "Puebla", isPopular: true },
  { city: "San Andrés Cholula", state: "Puebla" },
  { city: "Huejotzingo / Aeropuerto PBC", state: "Puebla", isAirport: true },
  { city: "Tehuacán", state: "Puebla" },

  // Quintana Roo
  { city: "Cancún", state: "Quintana Roo", isPopular: true },
  { city: "Playa del Carmen", state: "Quintana Roo", isPopular: true },
  { city: "Tulum", state: "Quintana Roo", isPopular: true },
  { city: "Cozumel", state: "Quintana Roo" },
  { city: "Chetumal", state: "Quintana Roo" },

  // Yucatán
  { city: "Mérida", state: "Yucatán", isPopular: true },
  { city: "Valladolid", state: "Yucatán" },
  { city: "Progreso", state: "Yucatán" },

  // Baja California
  { city: "Tijuana", state: "Baja California", isPopular: true },
  { city: "Mexicali", state: "Baja California" },
  { city: "Ensenada", state: "Baja California" },
  { city: "Playas de Rosarito", state: "Baja California" },

  // Baja California Sur
  { city: "La Paz", state: "Baja California Sur" },
  { city: "Los Cabos / San José del Cabo", state: "Baja California Sur", isPopular: true },
  { city: "Cabo San Lucas", state: "Baja California Sur", isPopular: true },

  // Aguascalientes
  { city: "Aguascalientes", state: "Aguascalientes", isPopular: true },
  { city: "Jesús María", state: "Aguascalientes" },

  // Chihuahua
  { city: "Ciudad Juárez", state: "Chihuahua", isPopular: true },
  { city: "Chihuahua", state: "Chihuahua" },

  // Coahuila
  { city: "Saltillo", state: "Coahuila" },
  { city: "Torreón", state: "Coahuila" },
  { city: "Ramos Arizpe", state: "Coahuila" },

  // Colima
  { city: "Colima", state: "Colima" },
  { city: "Manzanillo", state: "Colima" },

  // Chiapas
  { city: "Tuxtla Gutiérrez", state: "Chiapas" },
  { city: "San Cristóbal de las Casas", state: "Chiapas" },
  { city: "Tapachula", state: "Chiapas" },

  // Durango
  { city: "Durango", state: "Durango" },
  { city: "Gómez Palacio", state: "Durango" },

  // Guerrero
  { city: "Acapulco", state: "Guerrero" },
  { city: "Zihuatanejo / Ixtapa", state: "Guerrero" },
  { city: "Chilpancingo", state: "Guerrero" },

  // Hidalgo
  { city: "Pachuca", state: "Hidalgo" },
  { city: "Mineral de la Reforma", state: "Hidalgo" },
  { city: "Tulancingo", state: "Hidalgo" },

  // Michoacán
  { city: "Morelia", state: "Michoacán" },
  { city: "Uruapan", state: "Michoacán" },
  { city: "Zamora", state: "Michoacán" },

  // Morelos
  { city: "Cuernavaca", state: "Morelos" },
  { city: "Jiutepec", state: "Morelos" },

  // Nayarit
  { city: "Tepic", state: "Nayarit" },
  { city: "Bahía de Banderas / Nuevo Nayarit", state: "Nayarit" },

  // Oaxaca
  { city: "Oaxaca de Juárez", state: "Oaxaca" },
  { city: "Santa Cruz Huatulco", state: "Oaxaca" },
  { city: "Puerto Escondido", state: "Oaxaca" },

  // San Luis Potosí
  { city: "San Luis Potosí", state: "San Luis Potosí", isPopular: true },
  { city: "Soledad de Graciano Sánchez", state: "San Luis Potosí" },
  { city: "Ciudad Valles", state: "San Luis Potosí" },

  // Sinaloa
  { city: "Culiacán", state: "Sinaloa" },
  { city: "Mazatlán", state: "Sinaloa" },
  { city: "Los Mochis", state: "Sinaloa" },

  // Sonora
  { city: "Hermosillo", state: "Sonora" },
  { city: "Ciudad Obregón", state: "Sonora" },
  { city: "Nogales", state: "Sonora" },

  // Tabasco
  { city: "Villahermosa", state: "Tabasco" },
  { city: "Paraíso", state: "Tabasco" },

  // Tamaulipas
  { city: "Tampico", state: "Tamaulipas" },
  { city: "Reynosa", state: "Tamaulipas" },
  { city: "Matamoros", state: "Tamaulipas" },
  { city: "Nuevo Laredo", state: "Tamaulipas" },

  // Tlaxcala
  { city: "Tlaxcala", state: "Tlaxcala" },
  { city: "Apizaco", state: "Tlaxcala" },

  // Veracruz
  { city: "Veracruz", state: "Veracruz" },
  { city: "Boca del Río", state: "Veracruz" },
  { city: "Xalapa", state: "Veracruz" },
  { city: "Coatzacoalcos", state: "Veracruz" },

  // Zacatecas
  { city: "Zacatecas", state: "Zacatecas" },
  { city: "Guadalupe", state: "Zacatecas" },
  { city: "Fresnillo", state: "Zacatecas" },

  // Campeche
  { city: "Campeche", state: "Campeche" },
  { city: "Ciudad del Carmen", state: "Campeche" },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

interface CitySelectorProps {
  value: string;
  onChange: (city: string) => void;
  className?: string;
  placeholder?: string;
}

export default function CitySelector({
  value,
  onChange,
  className = "",
  placeholder = "Ej. León, Guanajuato",
}: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filtered items based on normalized search
  const filteredCities = useMemo(() => {
    const q = normalize(searchTerm);
    if (!q) {
      return MEXICAN_CITIES;
    }
    return MEXICAN_CITIES.filter(
      (item) =>
        normalize(item.city).includes(q) || normalize(item.state).includes(q)
    );
  }, [searchTerm]);

  // Open handler: auto-focus search input
  const handleOpen = () => {
    setIsOpen(true);
    setSearchTerm("");
    setActiveIndex(-1);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm("");
    setActiveIndex(-1);
  };

  const handleSelectCity = (cityName: string) => {
    onChange(cityName);
    handleClose();
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        e.preventDefault();
        handleOpen();
      }
      return;
    }

    // Free text check
    const hasCustomOption =
      searchTerm.trim().length > 0 &&
      !filteredCities.some(
        (c) => normalize(c.city) === normalize(searchTerm)
      );

    const totalCount = filteredCities.length + (hasCustomOption ? 1 : 0);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 < totalCount ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : totalCount - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (hasCustomOption && activeIndex === 0) {
        handleSelectCity(searchTerm.trim());
      } else {
        const itemIdx = hasCustomOption ? activeIndex - 1 : activeIndex;
        if (itemIdx >= 0 && itemIdx < filteredCities.length) {
          handleSelectCity(filteredCities[itemIdx].city);
        } else if (searchTerm.trim()) {
          handleSelectCity(searchTerm.trim());
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
    }
  };

  // Keep active item in view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.querySelector(
        `[data-index="${activeIndex}"]`
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex]);

  const hasCustomOption =
    searchTerm.trim().length > 0 &&
    !filteredCities.some(
      (c) => normalize(c.city) === normalize(searchTerm)
    );

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Combobox Trigger */}
      <button
        type="button"
        onClick={() => (isOpen ? handleClose() : handleOpen())}
        className="w-full flex items-center justify-between text-left group focus:outline-none"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center min-w-0 pr-2">
          <MapPin className="h-4 w-4 text-blue-600 shrink-0 mr-2.5 transition-transform group-hover:scale-110" />
          <span
            className={`block truncate text-sm font-semibold tracking-tight ${
              value ? "text-slate-900" : "text-slate-400"
            }`}
          >
            {value || placeholder}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-blue-600" : "group-hover:text-slate-600"
          }`}
        />
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2.5 w-full min-w-[320px] sm:min-w-[400px] max-w-[95vw] sm:max-w-md rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/15 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Popover Header & Real-time Search Input */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/80">
            <div className="relative flex items-center rounded-xl bg-white border border-slate-200/80 px-3 py-2 shadow-inner focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search className="h-4 w-4 text-slate-400 shrink-0 mr-2" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setActiveIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Buscar ciudad, municipio o estado..."
                className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    inputRef.current?.focus();
                  }}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Popover List Items */}
          <div
            ref={listRef}
            className="max-h-72 overflow-y-auto divide-y divide-slate-100/70 p-1.5 focus:outline-none"
            role="listbox"
          >
            {/* Free-text custom selection item */}
            {hasCustomOption && (
              <button
                type="button"
                data-index="0"
                onClick={() => handleSelectCity(searchTerm.trim())}
                className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  activeIndex === 0
                    ? "bg-blue-50 text-blue-900"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-blue-700">
                    Usar destino personalizado
                  </div>
                  <div className="truncate text-xs font-medium text-slate-600">
                    &ldquo;{searchTerm.trim()}&rdquo;
                  </div>
                </div>
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shrink-0">
                  Enter
                </span>
              </button>
            )}

            {/* Empty list with query */}
            {filteredCities.length === 0 && !hasCustomOption && (
              <div className="py-8 px-4 text-center text-xs text-slate-500">
                No encontramos coincidencias para &ldquo;{searchTerm}&rdquo;.
              </div>
            )}

            {/* Popular Section Header if search is empty */}
            {!searchTerm && (
              <div className="px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>Destinos Principales & Bajío</span>
              </div>
            )}

            {filteredCities.map((item, idx) => {
              const displayIdx = hasCustomOption ? idx + 1 : idx;
              const isSelected =
                normalize(item.city) === normalize(value);
              const isActive = activeIndex === displayIdx;

              return (
                <button
                  key={`${item.city}-${item.state}`}
                  type="button"
                  data-index={displayIdx}
                  onClick={() => handleSelectCity(item.city)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left transition-colors ${
                    isActive
                      ? "bg-blue-50/90 text-blue-900"
                      : isSelected
                      ? "bg-blue-50/50 text-slate-900 font-semibold"
                      : "hover:bg-slate-50 text-slate-800"
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center min-w-0 mr-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 mr-2.5 ${
                        item.isAirport
                          ? "bg-amber-50 text-amber-600"
                          : item.isPopular
                          ? "bg-blue-50 text-blue-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.isAirport ? (
                        <Plane className="h-3.5 w-3.5" />
                      ) : (
                        <MapPin className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="block truncate text-xs sm:text-sm font-semibold">
                        {item.city}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-md bg-slate-100 border border-slate-200/60 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                      {item.state}
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-blue-600 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Popover Footer Info */}
          <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>32 estados de la República Mexicana</span>
            <span className="text-[10px] text-slate-500">
              Usa ↑ ↓ para navegar
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
