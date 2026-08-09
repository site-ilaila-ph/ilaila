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
    features: ["about", "business", "food", "management", "home & landing"],
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
    features: ["business", "food", "management", "home & landing"],
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
        github: "",
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