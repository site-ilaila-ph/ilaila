export type Member = {
    name: string;
    github: string;
}

export type RoleConfig = {
    features: string[],
    members: Member[]
}

const team = {
  frontend: {
<<<<<<< HEAD
    features: ["tungkol dito", "negosyo", "pagkain", "pamamahala", "home at landing"],
=======
    features: ["about", "business", "food", "management", "home & landing"],
>>>>>>> b378b4f0ac00170818702674e7d768e7e1efb2f8
    members: [
      { 
        name: "Bellezas, Precious Mae F.", 
        github: "" 
      },
      { 
        name: "Magpantay, Alexa D.", 
        github: "" 
      },
      { 
        name: "Escarpe, Cheryl Lance D.", 
        github: "" 
      },
      { 
        name: "Arandia, Lujille F.", 
        github: "" 
      },
      { 
        name: "Baclas, Renz Cedrick B.", 
        github: "AolOTMP" 
      },
      { 
        name: "Bautista, Shen P.", 
        github: "" 
      },
      { 
        name: "Teofilo, Jethro Cyron G.", 
        github: "" 
      },
      { 
        name: "Fernandez, Claight H.", 
        github: ""
      },
      { 
        name: "Maliwat, Meg Ryan M.", 
        github: "" 
      },
    ],
  },
  backend: {
<<<<<<< HEAD
    features: ["negosyo", "pagkain", "pamamahala", "home at landing"],
=======
    features: ["business", "food", "management", "home & landing"],
>>>>>>> b378b4f0ac00170818702674e7d768e7e1efb2f8
    members: [
      {
        name: "Centeno, Lemer M.",
        github: "",
      },
      {
        name: "Casin, Reese Nicole D.",
        github: "",
      },
      {
        name: "Alejandria, Gaveriel Jhaztine C.",
        github: "",
      },
      {
        name: "Regole, Jhon David N.",
        github: "",
      },
      {
        name: "Padilla, Godfrey M.",
        github: "Godfrey245",
      },
      {
        name: "Moriente, Ken Cristan C.",
        github: "",
      },
      {
        name: "Tapion, John Michael C.",
        github: "",
      },
      {
        name: "Barrameda, Justin Joshua E.",
        github: "",
      },
      {
        name: "Sasaluya, Joem, T.",
        github: "",
      },
    ],
  },
};

export default team;