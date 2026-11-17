import { ChemicalElement, ElementCategory, MetallicType } from '../types/element';

export function getMetallicType(category: ElementCategory): MetallicType {
  if (category === 'nonmetal' || category === 'halogen' || category === 'noble-gas') {
    return 'nonmetal';
  }
  if (category === 'metalloid') {
    return 'metalloid';
  }
  return 'metal';
}

export const CAS_GROUP_LABELS: Record<number, string> = {
  1: '1A',
  2: '2A',
  3: '3B',
  4: '4B',
  5: '5B',
  6: '6B',
  7: '7B',
  8: '8B',
  9: '8B',
  10: '8B',
  11: '1B',
  12: '2B',
  13: '3A',
  14: '4A',
  15: '5A',
  16: '6A',
  17: '7A',
  18: '8A',
};

export function getCasGroupLabel(group: number): string {
  return CAS_GROUP_LABELS[group] ?? String(group);
}

export interface CategoryMeta {
  id: ElementCategory;
  label: string;
  shortLabel: string;
  tileBg: string;
  tileBorder: string;
  tileHoverBorder: string;
  accentText: string;
  swatchBg: string;
}

export const CATEGORY_META: Record<ElementCategory, CategoryMeta> = {
  'nonmetal': {
    id: 'nonmetal',
    label: 'Reactive Nonmetals',
    shortLabel: 'Nonmetals',
    tileBg: 'bg-sky-950/45',
    tileBorder: 'border-sky-800/60',
    tileHoverBorder: 'hover:border-sky-400/80',
    accentText: 'text-sky-300',
    swatchBg: 'bg-sky-400',
  },
  'noble-gas': {
    id: 'noble-gas',
    label: 'Noble Gases',
    shortLabel: 'Noble Gases',
    tileBg: 'bg-violet-950/45',
    tileBorder: 'border-violet-800/60',
    tileHoverBorder: 'hover:border-violet-400/80',
    accentText: 'text-violet-300',
    swatchBg: 'bg-violet-400',
  },
  'alkali-metal': {
    id: 'alkali-metal',
    label: 'Alkali Metals',
    shortLabel: 'Alkali',
    tileBg: 'bg-rose-950/45',
    tileBorder: 'border-rose-800/60',
    tileHoverBorder: 'hover:border-rose-400/80',
    accentText: 'text-rose-300',
    swatchBg: 'bg-rose-400',
  },
  'alkaline-earth': {
    id: 'alkaline-earth',
    label: 'Alkaline Earth Metals',
    shortLabel: 'Alkaline Earth',
    tileBg: 'bg-amber-950/40',
    tileBorder: 'border-amber-800/60',
    tileHoverBorder: 'hover:border-amber-400/80',
    accentText: 'text-amber-300',
    swatchBg: 'bg-amber-400',
  },
  'metalloid': {
    id: 'metalloid',
    label: 'Metalloids',
    shortLabel: 'Metalloids',
    tileBg: 'bg-teal-900/50',
    tileBorder: 'border-teal-600/65',
    tileHoverBorder: 'hover:border-teal-400/85',
    accentText: 'text-teal-200',
    swatchBg: 'bg-teal-400',
  },
  'halogen': {
    id: 'halogen',
    label: 'Halogens',
    shortLabel: 'Halogens',
    tileBg: 'bg-emerald-950/45',
    tileBorder: 'border-emerald-800/60',
    tileHoverBorder: 'hover:border-emerald-400/80',
    accentText: 'text-emerald-300',
    swatchBg: 'bg-emerald-400',
  },
  'transition-metal': {
    id: 'transition-metal',
    label: 'Transition Metals',
    shortLabel: 'Transition',
    tileBg: 'bg-slate-900/75',
    tileBorder: 'border-slate-700/70',
    tileHoverBorder: 'hover:border-slate-400/80',
    accentText: 'text-slate-200',
    swatchBg: 'bg-slate-400',
  },
  'post-transition': {
    id: 'post-transition',
    label: 'Post-Transition Metals',
    shortLabel: 'Post-Transition',
    tileBg: 'bg-indigo-950/45',
    tileBorder: 'border-indigo-800/60',
    tileHoverBorder: 'hover:border-indigo-400/80',
    accentText: 'text-indigo-300',
    swatchBg: 'bg-indigo-400',
  },
  'lanthanide': {
    id: 'lanthanide',
    label: 'Lanthanides',
    shortLabel: 'Lanthanides',
    tileBg: 'bg-cyan-950/45',
    tileBorder: 'border-cyan-800/60',
    tileHoverBorder: 'hover:border-cyan-400/80',
    accentText: 'text-cyan-300',
    swatchBg: 'bg-cyan-400',
  },
  'actinide': {
    id: 'actinide',
    label: 'Actinides',
    shortLabel: 'Actinides',
    tileBg: 'bg-orange-950/40',
    tileBorder: 'border-orange-800/60',
    tileHoverBorder: 'hover:border-orange-400/80',
    accentText: 'text-orange-300',
    swatchBg: 'bg-orange-400',
  },
};

export const ELEMENTS: ChemicalElement[] = [
  { number: 1, symbol: 'H', name: 'Hydrogen', atomicMass: '1.008', category: 'nonmetal', group: 1, period: 1, gridRow: 1, gridCol: 1, state: 'Gas', electronConfig: '1s¹', hint: 'Lightest and most abundant element in the universe' },
  { number: 2, symbol: 'He', name: 'Helium', atomicMass: '4.0026', category: 'noble-gas', group: 18, period: 1, gridRow: 1, gridCol: 18, state: 'Gas', electronConfig: '1s²', hint: 'Inert gas used in cryogenics and balloons' },
  { number: 3, symbol: 'Li', name: 'Lithium', atomicMass: '6.94', category: 'alkali-metal', group: 1, period: 2, gridRow: 2, gridCol: 1, state: 'Solid', electronConfig: '[He] 2s¹', hint: 'Lightest solid metal, key to rechargeable batteries' },
  { number: 4, symbol: 'Be', name: 'Beryllium', atomicMass: '9.0122', category: 'alkaline-earth', group: 2, period: 2, gridRow: 2, gridCol: 2, state: 'Solid', electronConfig: '[He] 2s²', hint: 'Lightweight metal used in aerospace alloys and X-ray windows' },
  { number: 5, symbol: 'B', name: 'Boron', atomicMass: '10.81', category: 'metalloid', group: 13, period: 2, gridRow: 2, gridCol: 13, state: 'Solid', electronConfig: '[He] 2s² 2p¹', hint: 'Used in borosilicate glass and high-strength fibers' },
  { number: 6, symbol: 'C', name: 'Carbon', atomicMass: '12.011', category: 'nonmetal', group: 14, period: 2, gridRow: 2, gridCol: 14, state: 'Solid', electronConfig: '[He] 2s² 2p²', hint: 'Backbone of organic chemistry; forms diamond and graphite' },
  { number: 7, symbol: 'N', name: 'Nitrogen', atomicMass: '14.007', category: 'nonmetal', group: 15, period: 2, gridRow: 2, gridCol: 15, state: 'Gas', electronConfig: '[He] 2s² 2p³', hint: 'Makes up 78% of Earth’s atmosphere' },
  { number: 8, symbol: 'O', name: 'Oxygen', atomicMass: '15.999', category: 'nonmetal', group: 16, period: 2, gridRow: 2, gridCol: 16, state: 'Gas', electronConfig: '[He] 2s² 2p⁴', hint: 'Essential for cellular respiration and combustion' },
  { number: 9, symbol: 'F', name: 'Fluorine', atomicMass: '18.998', category: 'halogen', group: 17, period: 2, gridRow: 2, gridCol: 17, state: 'Gas', electronConfig: '[He] 2s² 2p⁵', hint: 'Most electronegative and chemically reactive element' },
  { number: 10, symbol: 'Ne', name: 'Neon', atomicMass: '20.180', category: 'noble-gas', group: 18, period: 2, gridRow: 2, gridCol: 18, state: 'Gas', electronConfig: '[He] 2s² 2p⁶', hint: 'Glows bright reddish-orange in high-voltage discharge tubes' },

  { number: 11, symbol: 'Na', name: 'Sodium', atomicMass: '22.990', category: 'alkali-metal', group: 1, period: 3, gridRow: 3, gridCol: 1, state: 'Solid', electronConfig: '[Ne] 3s¹', hint: 'Symbol derives from Latin "natrium"; reacts vigorously with water' },
  { number: 12, symbol: 'Mg', name: 'Magnesium', atomicMass: '24.305', category: 'alkaline-earth', group: 2, period: 3, gridRow: 3, gridCol: 2, state: 'Solid', electronConfig: '[Ne] 3s²', hint: 'Central atom in chlorophyll molecules; burns with white flame' },
  { number: 13, symbol: 'Al', name: 'Aluminium', atomicMass: '26.982', category: 'post-transition', group: 13, period: 3, gridRow: 3, gridCol: 13, state: 'Solid', electronConfig: '[Ne] 3s² 3p¹', hint: 'Most abundant metal in Earth’s crust' },
  { number: 14, symbol: 'Si', name: 'Silicon', atomicMass: '28.085', category: 'metalloid', group: 14, period: 3, gridRow: 3, gridCol: 14, state: 'Solid', electronConfig: '[Ne] 3s² 3p²', hint: 'Foundation of modern semiconductor microchips' },
  { number: 15, symbol: 'P', name: 'Phosphorus', atomicMass: '30.974', category: 'nonmetal', group: 15, period: 3, gridRow: 3, gridCol: 15, state: 'Solid', electronConfig: '[Ne] 3s² 3p³', hint: 'Key component of DNA, ATP, and cell membranes' },
  { number: 16, symbol: 'S', name: 'Sulfur', atomicMass: '32.06', category: 'nonmetal', group: 16, period: 3, gridRow: 3, gridCol: 16, state: 'Solid', electronConfig: '[Ne] 3s² 3p⁴', hint: 'Bright yellow nonmetal essential for amino acids' },
  { number: 17, symbol: 'Cl', name: 'Chlorine', atomicMass: '35.45', category: 'halogen', group: 17, period: 3, gridRow: 3, gridCol: 17, state: 'Gas', electronConfig: '[Ne] 3s² 3p⁵', hint: 'Yellow-green halogen gas used in water purification' },
  { number: 18, symbol: 'Ar', name: 'Argon', atomicMass: '39.948', category: 'noble-gas', group: 18, period: 3, gridRow: 3, gridCol: 18, state: 'Gas', electronConfig: '[Ne] 3s² 3p⁶', hint: 'Third most abundant gas in Earth’s atmosphere' },

  { number: 19, symbol: 'K', name: 'Potassium', atomicMass: '39.098', category: 'alkali-metal', group: 1, period: 4, gridRow: 4, gridCol: 1, state: 'Solid', electronConfig: '[Ar] 4s¹', hint: 'Symbol derives from Latin "kalium"; vital electrolyte' },
  { number: 20, symbol: 'Ca', name: 'Calcium', atomicMass: '40.078', category: 'alkaline-earth', group: 2, period: 4, gridRow: 4, gridCol: 2, state: 'Solid', electronConfig: '[Ar] 4s²', hint: 'Essential mineral in bones, teeth, and limestone' },
  { number: 21, symbol: 'Sc', name: 'Scandium', atomicMass: '44.956', category: 'transition-metal', group: 3, period: 4, gridRow: 4, gridCol: 3, state: 'Solid', electronConfig: '[Ar] 3d¹ 4s²', hint: 'Silvery-white metal used in lightweight aerospace alloys' },
  { number: 22, symbol: 'Ti', name: 'Titanium', atomicMass: '47.867', category: 'transition-metal', group: 4, period: 4, gridRow: 4, gridCol: 4, state: 'Solid', electronConfig: '[Ar] 3d² 4s²', hint: 'High strength-to-weight corrosion-resistant metal' },
  { number: 23, symbol: 'V', name: 'Vanadium', atomicMass: '50.942', category: 'transition-metal', group: 5, period: 4, gridRow: 4, gridCol: 5, state: 'Solid', electronConfig: '[Ar] 3d³ 4s²', hint: 'Added to steel alloys for toughness and shock resistance' },
  { number: 24, symbol: 'Cr', name: 'Chromium', atomicMass: '51.996', category: 'transition-metal', group: 6, period: 4, gridRow: 4, gridCol: 6, state: 'Solid', electronConfig: '[Ar] 3d⁵ 4s¹', hint: 'Gives stainless steel its corrosion resistance and mirror finish' },
  { number: 25, symbol: 'Mn', name: 'Manganese', atomicMass: '54.938', category: 'transition-metal', group: 7, period: 4, gridRow: 4, gridCol: 7, state: 'Solid', electronConfig: '[Ar] 3d⁵ 4s²', hint: 'Essential in steelmaking and EV battery cathodes' },
  { number: 26, symbol: 'Fe', name: 'Iron', atomicMass: '55.845', category: 'transition-metal', group: 8, period: 4, gridRow: 4, gridCol: 8, state: 'Solid', electronConfig: '[Ar] 3d⁶ 4s²', hint: 'Symbol derives from Latin "ferrum"; carries oxygen in hemoglobin' },
  { number: 27, symbol: 'Co', name: 'Cobalt', atomicMass: '58.933', category: 'transition-metal', group: 9, period: 4, gridRow: 4, gridCol: 9, state: 'Solid', electronConfig: '[Ar] 3d⁷ 4s²', hint: 'Used in deep blue pigments and high-temperature superalloys' },
  { number: 28, symbol: 'Ni', name: 'Nickel', atomicMass: '58.693', category: 'transition-metal', group: 10, period: 4, gridRow: 4, gridCol: 10, state: 'Solid', electronConfig: '[Ar] 3d⁸ 4s²', hint: 'Corrosion-resistant metal used in coins and stainless steel' },
  { number: 29, symbol: 'Cu', name: 'Copper', atomicMass: '63.546', category: 'transition-metal', group: 11, period: 4, gridRow: 4, gridCol: 11, state: 'Solid', electronConfig: '[Ar] 3d¹⁰ 4s¹', hint: 'Symbol derives from Latin "cuprum"; premier electrical conductor' },
  { number: 30, symbol: 'Zn', name: 'Zinc', atomicMass: '65.38', category: 'transition-metal', group: 12, period: 4, gridRow: 4, gridCol: 12, state: 'Solid', electronConfig: '[Ar] 3d¹⁰ 4s²', hint: 'Used to galvanize steel against rust and in brass alloys' },
  { number: 31, symbol: 'Ga', name: 'Gallium', atomicMass: '69.723', category: 'post-transition', group: 13, period: 4, gridRow: 4, gridCol: 13, state: 'Solid', electronConfig: '[Ar] 3d¹⁰ 4s² 4p¹', hint: 'Melts just above room temperature (29.8 °C), right in your hand' },
  { number: 32, symbol: 'Ge', name: 'Germanium', atomicMass: '72.630', category: 'metalloid', group: 14, period: 4, gridRow: 4, gridCol: 14, state: 'Solid', electronConfig: '[Ar] 3d¹⁰ 4s² 4p²', hint: 'Semiconductor used in fiber optics and infrared lenses' },
  { number: 33, symbol: 'As', name: 'Arsenic', atomicMass: '74.922', category: 'metalloid', group: 15, period: 4, gridRow: 4, gridCol: 15, state: 'Solid', electronConfig: '[Ar] 3d¹⁰ 4s² 4p³', hint: 'Metalloid used as a dopant in gallium arsenide electronics' },
  { number: 34, symbol: 'Se', name: 'Selenium', atomicMass: '78.971', category: 'nonmetal', group: 16, period: 4, gridRow: 4, gridCol: 16, state: 'Solid', electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁴', hint: 'Photoconductive nonmetal used in solar cells and glassmaking' },
  { number: 35, symbol: 'Br', name: 'Bromine', atomicMass: '79.904', category: 'halogen', group: 17, period: 4, gridRow: 4, gridCol: 17, state: 'Liquid', electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁵', hint: 'Only nonmetallic element that is liquid at room temperature' },
  { number: 36, symbol: 'Kr', name: 'Krypton', atomicMass: '83.798', category: 'noble-gas', group: 18, period: 4, gridRow: 4, gridCol: 18, state: 'Gas', electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁶', hint: 'Noble gas used in high-speed photography flashes and lasers' },

  { number: 37, symbol: 'Rb', name: 'Rubidium', atomicMass: '85.468', category: 'alkali-metal', group: 1, period: 5, gridRow: 5, gridCol: 1, state: 'Solid', electronConfig: '[Kr] 5s¹', hint: 'Soft alkali metal used in precision atomic clocks' },
  { number: 38, symbol: 'Sr', name: 'Strontium', atomicMass: '87.62', category: 'alkaline-earth', group: 2, period: 5, gridRow: 5, gridCol: 2, state: 'Solid', electronConfig: '[Kr] 5s²', hint: 'Produces brilliant crimson-red color in fireworks and flares' },
  { number: 39, symbol: 'Y', name: 'Yttrium', atomicMass: '88.906', category: 'transition-metal', group: 3, period: 5, gridRow: 5, gridCol: 3, state: 'Solid', electronConfig: '[Kr] 4d¹ 5s²', hint: 'Named after Ytterby, Sweden; used in YAG lasers and LEDs' },
  { number: 40, symbol: 'Zr', name: 'Zirconium', atomicMass: '91.224', category: 'transition-metal', group: 4, period: 5, gridRow: 5, gridCol: 4, state: 'Solid', electronConfig: '[Kr] 4d² 5s²', hint: 'High melting-point metal used in ceramic crowns and reactors' },
  { number: 41, symbol: 'Nb', name: 'Niobium', atomicMass: '92.906', category: 'transition-metal', group: 5, period: 5, gridRow: 5, gridCol: 5, state: 'Solid', electronConfig: '[Kr] 4d⁴ 5s¹', hint: 'Superconducting metal used in MRI magnets and particle accelerators' },
  { number: 42, symbol: 'Mo', name: 'Molybdenum', atomicMass: '95.95', category: 'transition-metal', group: 6, period: 5, gridRow: 5, gridCol: 6, state: 'Solid', electronConfig: '[Kr] 4d⁵ 5s¹', hint: 'High-strength alloying metal; essential trace cofactor in enzymes' },
  { number: 43, symbol: 'Tc', name: 'Technetium', atomicMass: '98', category: 'transition-metal', group: 7, period: 5, gridRow: 5, gridCol: 7, state: 'Solid', electronConfig: '[Kr] 4d⁵ 5s²', hint: 'Lightest element with no stable isotopes; used in nuclear imaging' },
  { number: 44, symbol: 'Ru', name: 'Ruthenium', atomicMass: '101.07', category: 'transition-metal', group: 8, period: 5, gridRow: 5, gridCol: 8, state: 'Solid', electronConfig: '[Kr] 4d⁷ 5s¹', hint: 'Platinum-group metal used in wear-resistant electrical contacts' },
  { number: 45, symbol: 'Rh', name: 'Rhodium', atomicMass: '102.91', category: 'transition-metal', group: 9, period: 5, gridRow: 5, gridCol: 9, state: 'Solid', electronConfig: '[Kr] 4d⁸ 5s¹', hint: 'Rare, ultra-reflective precious metal used in catalytic converters' },
  { number: 46, symbol: 'Pd', name: 'Palladium', atomicMass: '106.42', category: 'transition-metal', group: 10, period: 5, gridRow: 5, gridCol: 10, state: 'Solid', electronConfig: '[Kr] 4d¹⁰', hint: 'Can absorb up to 900 times its own volume of hydrogen gas' },
  { number: 47, symbol: 'Ag', name: 'Silver', atomicMass: '107.87', category: 'transition-metal', group: 11, period: 5, gridRow: 5, gridCol: 11, state: 'Solid', electronConfig: '[Kr] 4d¹⁰ 5s¹', hint: 'Symbol derives from Latin "argentum"; highest electrical conductivity' },
  { number: 48, symbol: 'Cd', name: 'Cadmium', atomicMass: '112.41', category: 'transition-metal', group: 12, period: 5, gridRow: 5, gridCol: 12, state: 'Solid', electronConfig: '[Kr] 4d¹⁰ 5s²', hint: 'Soft bluish-white metal historically used in NiCd batteries' },
  { number: 49, symbol: 'In', name: 'Indium', atomicMass: '114.82', category: 'post-transition', group: 13, period: 5, gridRow: 5, gridCol: 13, state: 'Solid', electronConfig: '[Kr] 4d¹⁰ 5s² 5p¹', hint: 'Used in transparent conductive ITO coatings on touchscreens' },
  { number: 50, symbol: 'Sn', name: 'Tin', atomicMass: '118.71', category: 'post-transition', group: 14, period: 5, gridRow: 5, gridCol: 14, state: 'Solid', electronConfig: '[Kr] 4d¹⁰ 5s² 5p²', hint: 'Symbol derives from Latin "stannum"; forms bronze with copper' },
  { number: 51, symbol: 'Sb', name: 'Antimony', atomicMass: '121.76', category: 'metalloid', group: 15, period: 5, gridRow: 5, gridCol: 15, state: 'Solid', electronConfig: '[Kr] 4d¹⁰ 5s² 5p³', hint: 'Symbol derives from Latin "stibium"; used in flame retardants' },
  { number: 52, symbol: 'Te', name: 'Tellurium', atomicMass: '127.60', category: 'metalloid', group: 16, period: 5, gridRow: 5, gridCol: 16, state: 'Solid', electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁴', hint: 'Named after Earth ("tellus"); used in CdTe thin-film solar cells' },
  { number: 53, symbol: 'I', name: 'Iodine', atomicMass: '126.90', category: 'halogen', group: 17, period: 5, gridRow: 5, gridCol: 17, state: 'Solid', electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁵', hint: 'Sublimes into violet vapor; essential for thyroid hormones' },
  { number: 54, symbol: 'Xe', name: 'Xenon', atomicMass: '131.29', category: 'noble-gas', group: 18, period: 5, gridRow: 5, gridCol: 18, state: 'Gas', electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁶', hint: 'Dense noble gas used in spacecraft ion thrusters and arc lamps' },

  { number: 55, symbol: 'Cs', name: 'Cesium', atomicMass: '132.91', category: 'alkali-metal', group: 1, period: 6, gridRow: 6, gridCol: 1, state: 'Solid', electronConfig: '[Xe] 6s¹', hint: 'Defines the SI second via its hyperfine atomic transition' },
  { number: 56, symbol: 'Ba', name: 'Barium', atomicMass: '137.33', category: 'alkaline-earth', group: 2, period: 6, gridRow: 6, gridCol: 2, state: 'Solid', electronConfig: '[Xe] 6s²', hint: 'Produces bright green fireworks; used in medical X-ray contrast' },

  { number: 57, symbol: 'La', name: 'Lanthanum', atomicMass: '138.91', category: 'lanthanide', group: 3, period: 6, gridRow: 9, gridCol: 4, state: 'Solid', electronConfig: '[Xe] 5d¹ 6s²', hint: 'Prototype of the lanthanide series; used in camera lens glass' },
  { number: 58, symbol: 'Ce', name: 'Cerium', atomicMass: '140.12', category: 'lanthanide', group: 3, period: 6, gridRow: 9, gridCol: 5, state: 'Solid', electronConfig: '[Xe] 4f¹ 5d¹ 6s²', hint: 'Most abundant rare-earth element; sparks in ferrocerium flints' },
  { number: 59, symbol: 'Pr', name: 'Praseodymium', atomicMass: '140.91', category: 'lanthanide', group: 3, period: 6, gridRow: 9, gridCol: 6, state: 'Solid', electronConfig: '[Xe] 4f³ 6s²', hint: 'Used in high-strength aircraft magnets and welders’ goggles' },
  { number: 60, symbol: 'Nd', name: 'Neodymium', atomicMass: '144.24', category: 'lanthanide', group: 3, period: 6, gridRow: 9, gridCol: 7, state: 'Solid', electronConfig: '[Xe] 4f⁴ 6s²', hint: 'Creates the strongest permanent magnets known (NdFeB)' },
  { number: 61, symbol: 'Pm', name: 'Promethium', atomicMass: '145', category: 'lanthanide', group: 3, period: 6, gridRow: 9, gridCol: 8, state: 'Solid', electronConfig: '[Xe] 4f⁵ 6s²', hint: 'Radioactive lanthanide used in miniature nuclear batteries' },
  { number: 62, symbol: 'Sm', name: 'Samarium', atomicMass: '150.36', category: 'lanthanide', group: 3, period: 6, gridRow: 9, gridCol: 9, state: 'Solid', electronConfig: '[Xe] 4f⁶ 6s²', hint: 'Used in high-temperature samarium-cobalt permanent magnets' },
  { number: 63, symbol: 'Eu', name: 'Europium', atomicMass: '151.96', category: 'lanthanide', group: 3, period: 6, gridRow: 9, gridCol: 10, state: 'Solid', electronConfig: '[Xe] 4f⁷ 6s²', hint: 'Produces red and blue phosphors in anti-counterfeit banknotes' },
  { number: 64, symbol: 'Gd', name: 'Gadolinium', atomicMass: '157.25', category: 'lanthanide', group: 3, period: 6, gridRow: 9, gridCol: 11, state: 'Solid', electronConfig: '[Xe] 4f⁷ 5d¹ 6s²', hint: 'Strongly paramagnetic metal used in MRI contrast agents' },
  { number: 65, symbol: 'Tb', name: 'Terbium', atomicMass: '158.93', category: 'lanthanide', group: 3, period: 6, gridRow: 9, gridCol: 12, state: 'Solid', electronConfig: '[Xe] 4f⁹ 6s²', hint: 'Named after Ytterby; provides bright green phosphors' },
  { number: 66, symbol: 'Dy', name: 'Dysprosium', atomicMass: '162.50', category: 'lanthanide', group: 3, period: 6, gridRow: 9, gridCol: 13, state: 'Solid', electronConfig: '[Xe] 4f¹⁰ 6s²', hint: 'Added to EV motor magnets to retain strength at high heat' },
  { number: 67, symbol: 'Ho', name: 'Holmium', atomicMass: '164.93', category: 'lanthanide', group: 3, period: 6, gridRow: 9, gridCol: 14, state: 'Solid', electronConfig: '[Xe] 4f¹¹ 6s²', hint: 'Possesses the highest magnetic moment of any natural element' },
  { number: 68, symbol: 'Er', name: 'Erbium', atomicMass: '167.26', category: 'lanthanide', group: 3, period: 6, gridRow: 9, gridCol: 15, state: 'Solid', electronConfig: '[Xe] 4f¹² 6s²', hint: 'Amplifies light signals inside long-haul fiber-optic cables' },
  { number: 69, symbol: 'Tm', name: 'Thulium', atomicMass: '168.93', category: 'lanthanide', group: 3, period: 6, gridRow: 9, gridCol: 16, state: 'Solid', electronConfig: '[Xe] 4f¹³ 6s²', hint: 'Rare lanthanide used in portable X-ray sources and lasers' },
  { number: 70, symbol: 'Yb', name: 'Ytterbium', atomicMass: '173.05', category: 'lanthanide', group: 3, period: 6, gridRow: 9, gridCol: 17, state: 'Solid', electronConfig: '[Xe] 4f¹⁴ 6s²', hint: 'Used in ultra-precise optical lattice atomic clocks' },
  { number: 71, symbol: 'Lu', name: 'Lutetium', atomicMass: '174.97', category: 'lanthanide', group: 3, period: 6, gridRow: 9, gridCol: 18, state: 'Solid', electronConfig: '[Xe] 4f¹⁴ 5d¹ 6s²', hint: 'Densest and hardest of all lanthanide elements' },

  { number: 72, symbol: 'Hf', name: 'Hafnium', atomicMass: '178.49', category: 'transition-metal', group: 4, period: 6, gridRow: 6, gridCol: 4, state: 'Solid', electronConfig: '[Xe] 4f¹⁴ 5d² 6s²', hint: 'Used as a high-k gate dielectric in modern silicon CPUs' },
  { number: 73, symbol: 'Ta', name: 'Tantalum', atomicMass: '180.95', category: 'transition-metal', group: 5, period: 6, gridRow: 6, gridCol: 5, state: 'Solid', electronConfig: '[Xe] 4f¹⁴ 5d³ 6s²', hint: 'Corrosion-proof metal used in capacitors and surgical implants' },
  { number: 74, symbol: 'W', name: 'Tungsten', atomicMass: '183.84', category: 'transition-metal', group: 6, period: 6, gridRow: 6, gridCol: 6, state: 'Solid', electronConfig: '[Xe] 4f¹⁴ 5d⁴ 6s²', hint: 'Symbol derives from "wolfram"; highest melting point of all metals' },
  { number: 75, symbol: 'Re', name: 'Rhenium', atomicMass: '186.21', category: 'transition-metal', group: 7, period: 6, gridRow: 6, gridCol: 7, state: 'Solid', electronConfig: '[Xe] 4f¹⁴ 5d⁵ 6s²', hint: 'Ultra-rare heat-resistant metal used in jet turbine blades' },
  { number: 76, symbol: 'Os', name: 'Osmium', atomicMass: '190.23', category: 'transition-metal', group: 8, period: 6, gridRow: 6, gridCol: 8, state: 'Solid', electronConfig: '[Xe] 4f¹⁴ 5d⁶ 6s²', hint: 'Densest naturally occurring element on Earth (22.59 g/cm³)' },
  { number: 77, symbol: 'Ir', name: 'Iridium', atomicMass: '192.22', category: 'transition-metal', group: 9, period: 6, gridRow: 6, gridCol: 9, state: 'Solid', electronConfig: '[Xe] 4f¹⁴ 5d⁷ 6s²', hint: 'Extremely corrosion-resistant; abundant in asteroid impact layers' },
  { number: 78, symbol: 'Pt', name: 'Platinum', atomicMass: '195.08', category: 'transition-metal', group: 10, period: 6, gridRow: 6, gridCol: 10, state: 'Solid', electronConfig: '[Xe] 4f¹⁴ 5d⁹ 6s¹', hint: 'Precious catalyst metal used in fuel cells and fine jewelry' },
  { number: 79, symbol: 'Au', name: 'Gold', atomicMass: '196.97', category: 'transition-metal', group: 11, period: 6, gridRow: 6, gridCol: 11, state: 'Solid', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', hint: 'Symbol derives from Latin "aurum"; malleable and non-tarnishing' },
  { number: 80, symbol: 'Hg', name: 'Mercury', atomicMass: '200.59', category: 'transition-metal', group: 12, period: 6, gridRow: 6, gridCol: 12, state: 'Liquid', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s²', hint: 'Symbol derives from "hydrargyrum"; only liquid metal at STP' },
  { number: 81, symbol: 'Tl', name: 'Thallium', atomicMass: '204.38', category: 'post-transition', group: 13, period: 6, gridRow: 6, gridCol: 13, state: 'Solid', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹', hint: 'Named after its bright green spectral emission line ("thallos")' },
  { number: 82, symbol: 'Pb', name: 'Lead', atomicMass: '207.2', category: 'post-transition', group: 14, period: 6, gridRow: 6, gridCol: 14, state: 'Solid', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', hint: 'Symbol derives from Latin "plumbum"; dense radiation shield' },
  { number: 83, symbol: 'Bi', name: 'Bismuth', atomicMass: '208.98', category: 'post-transition', group: 15, period: 6, gridRow: 6, gridCol: 15, state: 'Solid', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³', hint: 'Forms iridescent hopper crystals; active ingredient in Pepto-Bismol' },
  { number: 84, symbol: 'Po', name: 'Polonium', atomicMass: '209', category: 'post-transition', group: 16, period: 6, gridRow: 6, gridCol: 16, state: 'Solid', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴', hint: 'Discovered by Marie & Pierre Curie; named after Poland' },
  { number: 85, symbol: 'At', name: 'Astatine', atomicMass: '210', category: 'halogen', group: 17, period: 6, gridRow: 6, gridCol: 17, state: 'Solid', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵', hint: 'Rarest naturally occurring element in Earth’s crust' },
  { number: 86, symbol: 'Rn', name: 'Radon', atomicMass: '222', category: 'noble-gas', group: 18, period: 6, gridRow: 6, gridCol: 18, state: 'Gas', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶', hint: 'Dense radioactive noble gas formed from radium decay' },

  { number: 87, symbol: 'Fr', name: 'Francium', atomicMass: '223', category: 'alkali-metal', group: 1, period: 7, gridRow: 7, gridCol: 1, state: 'Solid', electronConfig: '[Rn] 7s¹', hint: 'Heaviest alkali metal; extremely rare and radioactive' },
  { number: 88, symbol: 'Ra', name: 'Radium', atomicMass: '226', category: 'alkaline-earth', group: 2, period: 7, gridRow: 7, gridCol: 2, state: 'Solid', electronConfig: '[Rn] 7s²', hint: 'Luminescent radioactive element isolated by the Curies in 1898' },

  { number: 89, symbol: 'Ac', name: 'Actinium', atomicMass: '227', category: 'actinide', group: 3, period: 7, gridRow: 10, gridCol: 4, state: 'Solid', electronConfig: '[Rn] 6d¹ 7s²', hint: 'Glows pale blue in the dark due to intense Cherenkov/air ionization' },
  { number: 90, symbol: 'Th', name: 'Thorium', atomicMass: '232.04', category: 'actinide', group: 3, period: 7, gridRow: 10, gridCol: 5, state: 'Solid', electronConfig: '[Rn] 6d² 7s²', hint: 'Named after Thor; weakly radioactive nuclear fuel candidate' },
  { number: 91, symbol: 'Pa', name: 'Protactinium', atomicMass: '231.04', category: 'actinide', group: 3, period: 7, gridRow: 10, gridCol: 6, state: 'Solid', electronConfig: '[Rn] 5f² 6d¹ 7s²', hint: 'Dense silvery actinide that decays into actinium' },
  { number: 92, symbol: 'U', name: 'Uranium', atomicMass: '238.03', category: 'actinide', group: 3, period: 7, gridRow: 10, gridCol: 7, state: 'Solid', electronConfig: '[Rn] 5f³ 6d¹ 7s²', hint: 'Primary fuel for nuclear fission reactors; named after Uranus' },
  { number: 93, symbol: 'Np', name: 'Neptunium', atomicMass: '237', category: 'actinide', group: 3, period: 7, gridRow: 10, gridCol: 8, state: 'Solid', electronConfig: '[Rn] 5f⁴ 6d¹ 7s²', hint: 'First synthetic transuranium actinide; named after Neptune' },
  { number: 94, symbol: 'Pu', name: 'Plutonium', atomicMass: '244', category: 'actinide', group: 3, period: 7, gridRow: 10, gridCol: 9, state: 'Solid', electronConfig: '[Rn] 5f⁶ 7s²', hint: 'Powers deep-space probes like Voyager and Curiosity via RTGs' },
  { number: 95, symbol: 'Am', name: 'Americium', atomicMass: '243', category: 'actinide', group: 3, period: 7, gridRow: 10, gridCol: 10, state: 'Solid', electronConfig: '[Rn] 5f⁷ 7s²', hint: 'Tiny amounts are used in household ionization smoke detectors' },
  { number: 96, symbol: 'Cm', name: 'Curium', atomicMass: '247', category: 'actinide', group: 3, period: 7, gridRow: 10, gridCol: 11, state: 'Solid', electronConfig: '[Rn] 5f⁷ 6d¹ 7s²', hint: 'Named after Marie & Pierre Curie; used in Mars rover spectrometers' },
  { number: 97, symbol: 'Bk', name: 'Berkelium', atomicMass: '247', category: 'actinide', group: 3, period: 7, gridRow: 10, gridCol: 12, state: 'Solid', electronConfig: '[Rn] 5f⁹ 7s²', hint: 'Synthesized in Berkeley, California in 1949' },
  { number: 98, symbol: 'Cf', name: 'Californium', atomicMass: '251', category: 'actinide', group: 3, period: 7, gridRow: 10, gridCol: 13, state: 'Solid', electronConfig: '[Rn] 5f¹⁰ 7s²', hint: 'Potent neutron emitter used to start up nuclear reactors' },
  { number: 99, symbol: 'Es', name: 'Einsteinium', atomicMass: '252', category: 'actinide', group: 3, period: 7, gridRow: 10, gridCol: 14, state: 'Solid', electronConfig: '[Rn] 5f¹¹ 7s²', hint: 'Discovered in 1952 thermonuclear test debris; named after Einstein' },
  { number: 100, symbol: 'Fm', name: 'Fermium', atomicMass: '257', category: 'actinide', group: 3, period: 7, gridRow: 10, gridCol: 15, state: 'Solid', electronConfig: '[Rn] 5f¹² 7s²', hint: 'Named after nuclear physics pioneer Enrico Fermi' },
  { number: 101, symbol: 'Md', name: 'Mendelevium', atomicMass: '258', category: 'actinide', group: 3, period: 7, gridRow: 10, gridCol: 16, state: 'Solid', electronConfig: '[Rn] 5f¹³ 7s²', hint: 'Named after Dmitri Mendeleev, creator of the Periodic Table' },
  { number: 102, symbol: 'No', name: 'Nobelium', atomicMass: '259', category: 'actinide', group: 3, period: 7, gridRow: 10, gridCol: 17, state: 'Solid', electronConfig: '[Rn] 5f¹⁴ 7s²', hint: 'Synthetic actinide named in honor of Alfred Nobel' },
  { number: 103, symbol: 'Lr', name: 'Lawrencium', atomicMass: '266', category: 'actinide', group: 3, period: 7, gridRow: 10, gridCol: 18, state: 'Solid', electronConfig: '[Rn] 5f¹⁴ 7s² 7p¹', hint: 'Final element of the actinide series; named after Ernest Lawrence' },

  { number: 104, symbol: 'Rf', name: 'Rutherfordium', atomicMass: '267', category: 'transition-metal', group: 4, period: 7, gridRow: 7, gridCol: 4, state: 'Solid', electronConfig: '[Rn] 5f¹⁴ 6d² 7s²', hint: 'First transactinide element; named after Ernest Rutherford' },
  { number: 105, symbol: 'Db', name: 'Dubnium', atomicMass: '268', category: 'transition-metal', group: 5, period: 7, gridRow: 7, gridCol: 5, state: 'Solid', electronConfig: '[Rn] 5f¹⁴ 6d³ 7s²', hint: 'Named after the Joint Institute for Nuclear Research in Dubna' },
  { number: 106, symbol: 'Sg', name: 'Seaborgium', atomicMass: '269', category: 'transition-metal', group: 6, period: 7, gridRow: 7, gridCol: 6, state: 'Solid', electronConfig: '[Rn] 5f¹⁴ 6d⁴ 7s²', hint: 'Named after Nobel laureate Glenn T. Seaborg' },
  { number: 107, symbol: 'Bh', name: 'Bohrium', atomicMass: '270', category: 'transition-metal', group: 7, period: 7, gridRow: 7, gridCol: 7, state: 'Solid', electronConfig: '[Rn] 5f¹⁴ 6d⁵ 7s²', hint: 'Named in honor of atomic theorist Niels Bohr' },
  { number: 108, symbol: 'Hs', name: 'Hassium', atomicMass: '277', category: 'transition-metal', group: 8, period: 7, gridRow: 7, gridCol: 8, state: 'Solid', electronConfig: '[Rn] 5f¹⁴ 6d⁶ 7s²', hint: 'Named after the German state of Hesse where it was synthesized' },
  { number: 109, symbol: 'Mt', name: 'Meitnerium', atomicMass: '278', category: 'transition-metal', group: 9, period: 7, gridRow: 7, gridCol: 9, state: 'Solid', electronConfig: '[Rn] 5f¹⁴ 6d⁷ 7s²', hint: 'Honors Lise Meitner, co-discoverer of nuclear fission' },
  { number: 110, symbol: 'Ds', name: 'Darmstadtium', atomicMass: '281', category: 'transition-metal', group: 10, period: 7, gridRow: 7, gridCol: 10, state: 'Solid', electronConfig: '[Rn] 5f¹⁴ 6d⁸ 7s²', hint: 'Named after Darmstadt, Germany, home of the GSI research lab' },
  { number: 111, symbol: 'Rg', name: 'Roentgenium', atomicMass: '282', category: 'transition-metal', group: 11, period: 7, gridRow: 7, gridCol: 11, state: 'Solid', electronConfig: '[Rn] 5f¹⁴ 6d⁹ 7s²', hint: 'Named after Wilhelm Röntgen, discoverer of X-rays' },
  { number: 112, symbol: 'Cn', name: 'Copernicium', atomicMass: '285', category: 'transition-metal', group: 12, period: 7, gridRow: 7, gridCol: 12, state: 'Liquid', electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s²', hint: 'Named after astronomer Nicolaus Copernicus' },
  { number: 113, symbol: 'Nh', name: 'Nihonium', atomicMass: '286', category: 'post-transition', group: 13, period: 7, gridRow: 7, gridCol: 13, state: 'Solid', electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹', hint: 'First element discovered in Asia; named after Japan ("Nihon")' },
  { number: 114, symbol: 'Fl', name: 'Flerovium', atomicMass: '289', category: 'post-transition', group: 14, period: 7, gridRow: 7, gridCol: 14, state: 'Solid', electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²', hint: 'Named after the Flerov Laboratory of Nuclear Reactions' },
  { number: 115, symbol: 'Mc', name: 'Moscovium', atomicMass: '290', category: 'post-transition', group: 15, period: 7, gridRow: 7, gridCol: 15, state: 'Solid', electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³', hint: 'Superheavy pnictogen named after the Moscow region' },
  { number: 116, symbol: 'Lv', name: 'Livermorium', atomicMass: '293', category: 'post-transition', group: 16, period: 7, gridRow: 7, gridCol: 16, state: 'Solid', electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴', hint: 'Named after Lawrence Livermore National Laboratory' },
  { number: 117, symbol: 'Ts', name: 'Tennessine', atomicMass: '294', category: 'halogen', group: 17, period: 7, gridRow: 7, gridCol: 17, state: 'Solid', electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵', hint: 'Second-heaviest element; honors Tennessee research institutions' },
  { number: 118, symbol: 'Og', name: 'Oganesson', atomicMass: '294', category: 'noble-gas', group: 18, period: 7, gridRow: 7, gridCol: 18, state: 'Solid', electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶', hint: 'Heaviest known element; named after physicist Yuri Oganessian' },
];

export interface StudyPreset {
  id: string;
  label: string;
  description: string;
  numbers: number[];
}

export const STUDY_PRESETS: StudyPreset[] = [
  {
    id: 'noble-halogens',
    label: 'Gases & Halogens',
    description: 'Noble gases and halogens (Groups 17 & 18)',
    numbers: [2, 9, 10, 17, 18, 35, 36, 53, 54, 85, 86, 117, 118],
  },
  {
    id: 'period-4-metals',
    label: 'Period 4 Metals',
    description: 'Scandium through Zinc (21–30)',
    numbers: Array.from({ length: 10 }, (_, i) => i + 21),
  },
  {
    id: 'all-118',
    label: 'All 118',
    description: 'Complete Periodic Table',
    numbers: ELEMENTS.map((e) => e.number),
  },
];
