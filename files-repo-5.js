const fileDataMapRepo = new Map();

function initializeFileRepo(){

fileDataMapRepo.set("Articulated-Dragon.gcode.3mf", {
      fileName: "Articulated-Dragon.gcode.3mf",
      defaultTags: ["Bambu X1C", "PLA"],
      defaultTagsNum,
      printTime,
      printHours: 1,
      printMins: 55,
      dayUploaded,
      monthUploaded,
      yearUploaded,
      zHeight: 0.2,
      filamentWeight: 42,
      defaultReleaseTemp: 29,
      productionNotes: "",
      fileFlag: false,
      fileFav: false,
      fileFolders: ["All Files", "Articulated Toys"]
});

fileDataMapRepo.set("Articulated-Dragon_Small.gcode.3mf", {
      fileName: "Articulated-Dragon_Small.gcode.3mf",
      defaultTags: ["Bambu A1", "PLA"],
      defaultTagsNum,
      printTime,
      printHours: 1,
      printMins: 20,
      dayUploaded,
      monthUploaded,
      yearUploaded,
      zHeight: 0.2,
      filamentWeight: 28,
      defaultReleaseTemp: 29,
      productionNotes: "",
      fileFlag: false,
      fileFav: false,
      fileFolders: ["All Files", "Articulated Toys"]
});

fileDataMapRepo.set("Flexi-Snake_Medium.gcode.3mf", {
      fileName: "Flexi-Snake_Medium.gcode.3mf",
      defaultTags: ["Bambu A1 Mini", "PLA"],
      defaultTagsNum,
      printTime,
      printHours: 1,
      printMins: 35,
      dayUploaded,
      monthUploaded,
      yearUploaded,
      zHeight: 0.2,
      filamentWeight: 36,
      defaultReleaseTemp: 29,
      productionNotes: "",
      fileFlag: false,
      fileFav: false,
      fileFolders: ["All Files", "Articulated Toys"]
});

fileDataMapRepo.set("Flexi-Lizard_Mini.gcode.3mf", {
      fileName: "Flexi-Lizard_Mini.gcode.3mf",
      defaultTags: ["Bambu A1 Mini", "PLA"],
      defaultTagsNum,
      printTime,
      printHours: 0,
      printMins: 50,
      dayUploaded,
      monthUploaded,
      yearUploaded,
      zHeight: 0.2,
      filamentWeight: 19,
      defaultReleaseTemp: 29,
      productionNotes: "",
      fileFlag: false,
      fileFav: false,
      fileFolders: ["All Files", "Articulated Toys"]
});

fileDataMapRepo.set("Baby-Octopus_Flex.gcode.3mf", {
      fileName: "Baby-Octopus_Flex.gcode.3mf",
      defaultTags: ["Bambu P1P", "TPU"],
      defaultTagsNum,
      printTime,
      printHours: 1,
      printMins: 40,
      dayUploaded,
      monthUploaded,
      yearUploaded,
      zHeight: 0.2,
      filamentWeight: 33,
      defaultReleaseTemp: 29,
      productionNotes: "",
      fileFlag: false,
      fileFav: false,
      fileFolders: ["All Files", "Articulated Toys"]
});
  fileDataMapRepo.set("Articulated-Dragon_Large.gcode.3mf", {
      fileName: "Articulated-Dragon_Large.gcode.3mf",
      defaultTags: ["Bambu X1C", "PLA"],
      defaultTagsNum,
      printTime,
      printHours: 2,
      printMins: 20,
      dayUploaded,
      monthUploaded,
      yearUploaded,
      zHeight: 0.2,
      filamentWeight: 47,
      defaultReleaseTemp: 29,
      productionNotes: "",
      fileFlag: false,
      fileFav: false,
      fileFolders: ["All Files", "Articulated Toys"]
});

fileDataMapRepo.set("Puzzle-Box_LockAndSlide.gcode.3mf", {
      fileName: "Puzzle-Box_LockAndSlide.gcode.3mf",
      defaultTags: ["Bambu P1S", "PLA"],
      defaultTagsNum,
      printTime,
      printHours: 1,
      printMins: 25,
      dayUploaded,
      monthUploaded,
      yearUploaded,
      zHeight: 0.2,
      filamentWeight: 31,
      defaultReleaseTemp: 29,
      productionNotes: "",
      fileFlag: false,
      fileFav: false,
      fileFolders: ["All Files", "Games"]
});

fileDataMapRepo.set("Infinity-Cube_Frame.gcode.3mf", {
      fileName: "Infinity-Cube_Frame.gcode.3mf",
      defaultTags: ["Bambu A1", "PLA"],
      defaultTagsNum,
      printTime,
      printHours: 1,
      printMins: 5,
      dayUploaded,
      monthUploaded,
      yearUploaded,
      zHeight: 0.2,
      filamentWeight: 22,
      defaultReleaseTemp: 29,
      productionNotes: "",
      fileFlag: false,
      fileFav: false,
      fileFolders: ["All Files", "Games"]
});

fileDataMapRepo.set("Infinity-Cube_Joints.gcode.3mf", {
      fileName: "Infinity-Cube_Joints.gcode.3mf",
      defaultTags: ["Bambu A1", "PLA"],
      defaultTagsNum,
      printTime,
      printHours: 0,
      printMins: 55,
      dayUploaded,
      monthUploaded,
      yearUploaded,
      zHeight: 0.2,
      filamentWeight: 18,
      defaultReleaseTemp: 29,
      productionNotes: "",
      fileFlag: false,
      fileFav: false,
      fileFolders: ["All Files", "Games"]
});

fileDataMapRepo.set("Puzzle-Box_GearRelease.gcode.3mf", {
      fileName: "Puzzle-Box_GearRelease.gcode.3mf",
      defaultTags: ["Bambu X1C", "PETG"],
      defaultTagsNum,
      printTime,
      printHours: 2,
      printMins: 10,
      dayUploaded,
      monthUploaded,
      yearUploaded,
      zHeight: 0.2,
      filamentWeight: 44,
      defaultReleaseTemp: 29,
      productionNotes: "",
      fileFlag: false,
      fileFav: false,
      fileFolders: ["All Files", "Games"]
});
fileDataMapRepo.set("Secret-Compartment_Box-Top.gcode.3mf", {
      fileName: "Secret-Compartment_Box-Top.gcode.3mf",
      defaultTags: ["Bambu X1C", "PLA"],
      defaultTagsNum,
      printTime,
      printHours: 1,
      printMins: 45,
      dayUploaded,
      monthUploaded,
      yearUploaded,
      zHeight: 0.2,
      filamentWeight: 38,
      defaultReleaseTemp: 29,
      productionNotes: "",
      fileFlag: false,
      fileFav: false,
      fileFolders: ["All Files", "Games"]
});

fileDataMapRepo.set("Secret-Compartment_Box-Bottom.gcode.3mf", {
      fileName: "Secret-Compartment_Box-Bottom.gcode.3mf",
      defaultTags: ["Bambu X1C", "PLA"],
      defaultTagsNum,
      printTime,
      printHours: 2,
      printMins: 0,
      dayUploaded,
      monthUploaded,
      yearUploaded,
      zHeight: 0.2,
      filamentWeight: 42,
      defaultReleaseTemp: 29,
      productionNotes: "",
      fileFlag: false,
      fileFav: false,
      fileFolders: ["All Files", "Games"]
});

fileDataMapRepo.set("Cryptex-Mini_Part1.gcode.3mf", {
      fileName: "Cryptex-Mini_Part1.gcode.3mf",
      defaultTags: ["Bambu P1P", "PLA"],
      defaultTagsNum,
      printTime,
      printHours: 1,
      printMins: 15,
      dayUploaded,
      monthUploaded,
      yearUploaded,
      zHeight: 0.2,
      filamentWeight: 27,
      defaultReleaseTemp: 29,
      productionNotes: "",
      fileFlag: false,
      fileFav: false,
      fileFolders: ["All Files", "Games"]
});

fileDataMapRepo.set("Cryptex-Mini_Part2.gcode.3mf", {
      fileName: "Cryptex-Mini_Part2.gcode.3mf",
      defaultTags: ["Bambu P1P", "PLA"],
      defaultTagsNum,
      printTime,
      printHours: 1,
      printMins: 0,
      dayUploaded,
      monthUploaded,
      yearUploaded,
      zHeight: 0.2,
      filamentWeight: 24,
      defaultReleaseTemp: 29,
      productionNotes: "",
      fileFlag: false,
      fileFav: false,
      fileFolders: ["All Files", "Games"]
});

fileDataMapRepo.set("Warhammer_Mini-Base32mm.gcode.3mf", {
      fileName: "Warhammer_Mini-Base32mm.gcode.3mf",
      defaultTags: ["Bambu A1 Mini", "PLA"],
      defaultTagsNum,
      printTime,
      printHours: 0,
      printMins: 20,
      dayUploaded,
      monthUploaded,
      yearUploaded,
      zHeight: 0.16,
      filamentWeight: 6,
      defaultReleaseTemp: 29,
      productionNotes: "",
      fileFlag: false,
      fileFav: false,
      fileFolders: ["All Files", "Games"]
});

fileDataMapRepo.set("Marble-Run_Track-SectionA.gcode", {
      fileName: "Marble-Run_Track-SectionA.gcode",
      defaultTags: ["Prusa Mk3", "PLA"],
      defaultTagsNum,
      printTime,
      printHours: 1,
      printMins: 30,
      dayUploaded,
      monthUploaded,
      yearUploaded,
      zHeight: 0.28,
      filamentWeight: 34,
      defaultReleaseTemp: 29,
      productionNotes: "",
      fileFlag: false,
      fileFav: false,
      fileFolders: ["All Files", "Games"]
});

fileDataMapRepo.set("Marble-Run_Track-Loop.gcode", {
      fileName: "Marble-Run_Track-Loop.gcode",
      defaultTags: ["CR10", "PLA"],
      defaultTagsNum,
      printTime,
      printHours: 1,
      printMins: 50,
      dayUploaded,
      monthUploaded,
      yearUploaded,
      zHeight: 0.28,
      filamentWeight: 40,
      defaultReleaseTemp: 29,
      productionNotes: "",
      fileFlag: false,
      fileFav: false,
      fileFolders: ["All Files", "Games"]
});

fileDataMapRepo.set("Working-Gearbox_Demo.gcode.3mf", {
      fileName: "Working-Gearbox_Demo.gcode.3mf",
      defaultTags: ["Bambu X1C", "PETG"],
      defaultTagsNum,
      printTime,
      printHours: 2,
      printMins: 30,
      dayUploaded,
      monthUploaded,
      yearUploaded,
      zHeight: 0.2,
      filamentWeight: 51,
      defaultReleaseTemp: 29,
      productionNotes: "",
      fileFlag: false,
      fileFav: false,
      fileFolders: ["All Files", "Games"]
});

}
