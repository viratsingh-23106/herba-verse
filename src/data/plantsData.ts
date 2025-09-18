import aloeVeraImage from '@/assets/aloe-vera.jpg';
import realAloeVeraImage from '@/assets/real-aloe-vera.jpg';
import turmericImage from '@/assets/turmeric.jpg';
import realTurmericImage from '@/assets/real-turmeric.jpg';
import neemImage from '@/assets/neem.jpg';
import realNeemImage from '@/assets/real-neem.jpg';

export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  uses: string[];
  image: string;
  realImages?: string[]; // Array of real plant photos
  color?: string;
  habitat: string;
  cultivation: string;
  medicinalParts: string[];
  preparationMethods: string[];
  dosage: string;
  precautions: string[];
  references: { text: string; url: string }[];
  ayurvedicProperties?: {
    rasa: string; // Taste
    guna: string; // Quality
    virya: string; // Potency
    vipaka: string; // Post-digestive effect
  };
}

export const plantsData: Plant[] = [
  {
    id: "aloe-vera",
    name: "Aloe Vera",
    scientificName: "Aloe barbadensis miller",
    description: "A succulent plant species known for its thick, fleshy leaves containing a clear gel with remarkable healing properties. Widely used in traditional medicine for skin conditions and digestive health.",
    uses: ["Skin Care", "Digestive Health", "Anti-inflammatory", "Wound Healing", "Burns Treatment"],
    image: aloeVeraImage,
    realImages: [realAloeVeraImage],
    color: "#22c55e",
    habitat: "Native to Arabian Peninsula, now cultivated worldwide in tropical and subtropical regions",
    cultivation: "Requires well-draining soil, bright indirect sunlight, and minimal watering. Drought-tolerant and easy to grow indoors.",
    medicinalParts: ["Leaves", "Gel"],
    preparationMethods: ["Fresh Gel", "Juice", "Powder", "Extract"],
    dosage: "External: Apply gel directly to skin. Internal: 1-2 tablespoons of juice daily (consult healthcare provider)",
    precautions: ["May cause allergic reactions in some individuals", "Internal use should be limited", "Not recommended during pregnancy"],
    references: [
      { text: "Surjushe, A., et al. (2008). Aloe vera: a short review. Indian Journal of Dermatology", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2763764/" },
      { text: "Ayurvedic Pharmacopoeia of India, Part I, Volume VI", url: "https://www.ayush.gov.in/docs/ayurvedic-pharmacopoeia.pdf" }
    ],
    ayurvedicProperties: {
      rasa: "Tikta (Bitter), Kashaya (Astringent)",
      guna: "Guru (Heavy), Snigdha (Unctuous)",
      virya: "Sheeta (Cold)",
      vipaka: "Katu (Pungent)"
    }
  },
  {
    id: "turmeric",
    name: "Turmeric",
    scientificName: "Curcuma longa",
    description: "A flowering plant of the ginger family, renowned for its golden-yellow rhizome containing curcumin, a powerful anti-inflammatory and antioxidant compound used in cooking and medicine.",
    uses: ["Anti-inflammatory", "Antioxidant", "Immunity", "Digestive Health", "Pain Relief", "Skin Care"],
    image: turmericImage,
    realImages: [realTurmericImage],
    color: "#f59e0b",
    habitat: "Native to Southeast Asia, primarily cultivated in India, Thailand, and other tropical regions",
    cultivation: "Requires warm, humid climate with well-drained soil. Grows best in temperatures between 20-30°C with adequate rainfall.",
    medicinalParts: ["Rhizomes", "Roots"],
    preparationMethods: ["Powder", "Fresh Paste", "Extract", "Oil", "Tea"],
    dosage: "1-3 grams daily as powder, or 1-2 teaspoons fresh paste. For therapeutic use, consult healthcare provider.",
    precautions: ["May increase bleeding risk", "Can interfere with certain medications", "High doses may cause stomach upset"],
    references: [
      { text: "Aggarwal, B.B., et al. (2007). Curcumin: the Indian solid gold. Advances in Experimental Medicine", url: "https://pubmed.ncbi.nlm.nih.gov/17569207/" },
      { text: "Ayurvedic Pharmacopoeia of India, Part I, Volume I", url: "https://www.ayush.gov.in/docs/ayurvedic-pharmacopoeia.pdf" }
    ],
    ayurvedicProperties: {
      rasa: "Tikta (Bitter), Katu (Pungent)",
      guna: "Ruksha (Dry), Laghu (Light)",
      virya: "Ushna (Hot)",
      vipaka: "Katu (Pungent)"
    }
  },
  {
    id: "neem",
    name: "Neem",
    scientificName: "Azadirachta indica",
    description: "Known as the 'Divine Tree' in Ayurveda, neem is a powerful medicinal tree with antibacterial, antifungal, and antiviral properties. Every part of the tree has therapeutic value.",
    uses: ["Skin Care", "Immunity", "Anti-bacterial", "Anti-fungal", "Oral Health", "Pest Control"],
    image: neemImage,
    realImages: [realNeemImage],
    color: "#059669",
    habitat: "Native to Indian subcontinent, now found throughout tropical and semi-tropical regions",
    cultivation: "Highly adaptable tree that grows in various soil types. Drought-resistant and requires minimal care once established.",
    medicinalParts: ["Leaves", "Bark", "Seeds", "Oil"],
    preparationMethods: ["Leaf Powder", "Oil", "Extract", "Fresh Leaves", "Bark Decoction"],
    dosage: "Leaves: 2-4 grams powder daily. Oil: External use only. Consult healthcare provider for internal use.",
    precautions: ["Not recommended during pregnancy", "May lower blood sugar", "Can be toxic in large quantities"],
    references: [
      { text: "Biswas, K., et al. (2002). Biological activities and medicinal properties of neem. Current Science", url: "https://www.currentscience.ac.in/Downloads/article_id_082_11_1336_1345_0.pdf" },
      { text: "Ayurvedic Pharmacopoeia of India, Part I, Volume II", url: "https://www.ayurveda.hu/api/API-Vol-1.pdf" }
    ],
    ayurvedicProperties: {
      rasa: "Tikta (Bitter), Kashaya (Astringent)",
      guna: "Laghu (Light), Ruksha (Dry)",
      virya: "Sheeta (Cold)",
      vipaka: "Katu (Pungent)"
    }
  }
];

// Mock additional plants for demonstration
export const additionalPlants = [
  "Ashwagandha", "Brahmi", "Tulsi", "Ginger", "Fenugreek", "Moringa",
  "Triphala", "Guggul", "Shankhpushpi", "Arjuna", "Manjistha", "Haritaki"
].map((name, index) => ({
  id: name.toLowerCase().replace(/\s+/g, '-'),
  name,
  scientificName: `${name} species`,
  description: `Traditional medicinal plant with various therapeutic benefits documented in Ayurvedic literature.`,
  uses: ["Immunity", "General Health", "Traditional Medicine"],
  image: "/placeholder.svg",
  color: ["#22c55e", "#f59e0b", "#059669", "#8b5cf6", "#ef4444", "#06b6d4"][index % 6],
  habitat: "Various regions of India and Southeast Asia",
  cultivation: "Traditional cultivation methods",
  medicinalParts: ["Leaves", "Roots"],
  preparationMethods: ["Powder", "Extract"],
  dosage: "As directed by healthcare provider",
  precautions: ["Consult healthcare provider before use"],
  references: ["Traditional Ayurvedic texts"]
}));