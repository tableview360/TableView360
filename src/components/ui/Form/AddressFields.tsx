import React from 'react';

interface AddressFieldsProps {
  country: string;
  city: string;
  street: string;
  number: string;
  postalCode: string;
  setCountry: (v: string) => void;
  setCity: (v: string) => void;
  setStreet: (v: string) => void;
  setNumber: (v: string) => void;
  setPostalCode: (v: string) => void;
}

const AddressFields = ({
  country,
  city,
  street,
  number,
  postalCode,
  setCountry,
  setCity,
  setStreet,
  setNumber,
  setPostalCode,
}: AddressFieldsProps) => (
  <div className="pt-4 border-t border-slate-700/50 space-y-5">
    <div className="flex items-center gap-2 text-slate-300">
      <span className="text-sm font-medium">Restaurant Address</span>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <input
        type="text"
        placeholder="Country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        required
        className="w-full px-4 py-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:bg-slate-800/60 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
      />
      <input
        type="text"
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        required
        className="w-full px-4 py-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:bg-slate-800/60 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
      />
    </div>
    <input
      type="text"
      placeholder="Street Address"
      value={street}
      onChange={(e) => setStreet(e.target.value)}
      required
      className="w-full px-4 py-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:bg-slate-800/60 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
    />
    <div className="grid grid-cols-2 gap-4">
      <input
        type="text"
        placeholder="Number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        required
        className="w-full px-4 py-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:bg-slate-800/60 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
      />
      <input
        type="text"
        placeholder="Postal Code"
        value={postalCode}
        onChange={(e) => setPostalCode(e.target.value)}
        required
        className="w-full px-4 py-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:bg-slate-800/60 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
      />
    </div>
  </div>
);

export default AddressFields;
