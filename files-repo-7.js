const fileDataMapRepo = new Map();

function initializeFileRepo() {
  const now = new Date();
  const dayUploaded = now.getDate();
  const monthUploaded = now.getMonth() + 1;
  const yearUploaded = now.getFullYear();

  function addFile({ fileName, defaultTags, printHours, printMins, zHeight, filamentWeight, folder }) {
    const printTime = (printHours * 60) + printMins;

    fileDataMapRepo.set(fileName, {
      fileName,
      defaultTags,
      defaultTagsNum: defaultTags.length,
      printTime,
      printHours,
      printMins,
      dayUploaded,
      monthUploaded,
      yearUploaded,
      zHeight,
      filamentWeight,
      defaultReleaseTemp: 29,
      productionNotes: "",
      fileFlag: false,
      fileFav: false,
      fileFolders
    });
  }

  addFile({ fileName: "Articulated-Dragon.gcode.3mf", defaultTags: ["Bambu X1C", "PLA"], printHours: 1, printMins: 55, zHeight: 0.2, filamentWeight: 42, fileFolders: ["All", "Articulated Toys"] });
  addFile({ fileName: "Articulated-Dragon_Small.gcode.3mf", defaultTags: ["Bambu A1", "PLA"], printHours: 1, printMins: 20, zHeight: 0.2, filamentWeight: 28, fileFolders: ["All", "Articulated Toys"] });
  addFile({ fileName: "Flexi-Snake_Medium.gcode.3mf", defaultTags: ["Bambu A1 Mini", "PLA"], printHours: 1, printMins: 35, zHeight: 0.2, filamentWeight: 36, fileFolders: ["All", "Articulated Toys"] });
  addFile({ fileName: "Flexi-Lizard_Mini.gcode.3mf", defaultTags: ["Bambu A1 Mini", "PLA"], printHours: 0, printMins: 50, zHeight: 0.2, filamentWeight: 19, fileFolders: ["All", "Articulated Toys"] });
  addFile({ fileName: "Baby-Octopus_Flex.gcode.3mf", defaultTags: ["Bambu P1P", "TPU"], printHours: 1, printMins: 40, zHeight: 0.2, filamentWeight: 33, fileFolders: ["All", "Articulated Toys"] });
  addFile({ fileName: "Articulated-Dragon_Large.gcode.3mf", defaultTags: ["Bambu X1C", "PLA"], printHours: 2, printMins: 20, zHeight: 0.2, filamentWeight: 47, fileFolders: ["All", "Articulated Toys"] });

  addFile({ fileName: "Puzzle-Box_LockAndSlide.gcode.3mf", defaultTags: ["Bambu P1S", "PLA"], printHours: 1, printMins: 25, zHeight: 0.2, filamentWeight: 31, fileFolders: ["All", "Games"] });
  addFile({ fileName: "Infinity-Cube_Frame.gcode.3mf", defaultTags: ["Bambu A1", "PLA"], printHours: 1, printMins: 5, zHeight: 0.2, filamentWeight: 22, fileFolders: ["All", "Games"] });
  addFile({ fileName: "Infinity-Cube_Joints.gcode.3mf", defaultTags: ["Bambu A1", "PLA"], printHours: 0, printMins: 55, zHeight: 0.2, filamentWeight: 18, fileFolders: ["All", "Games"] });
  addFile({ fileName: "Puzzle-Box_GearRelease.gcode.3mf", defaultTags: ["Bambu X1C", "PETG"], printHours: 2, printMins: 10, zHeight: 0.2, filamentWeight: 44, fileFolders: ["All", "Games"] });
  addFile({ fileName: "Secret-Compartment_Box-Top.gcode.3mf", defaultTags: ["Bambu X1C", "PLA"], printHours: 1, printMins: 45, zHeight: 0.2, filamentWeight: 38, fileFolders: ["All", "Games"] });
  addFile({ fileName: "Secret-Compartment_Box-Bottom.gcode.3mf", defaultTags: ["Bambu X1C", "PLA"], printHours: 2, printMins: 0, zHeight: 0.2, filamentWeight: 42, fileFolders: ["All", "Games"] });
  addFile({ fileName: "Cryptex-Mini_Part1.gcode.3mf", defaultTags: ["Bambu P1P", "PLA"], printHours: 1, printMins: 15, zHeight: 0.2, filamentWeight: 27, fileFolders: ["All", "Games"] });
  addFile({ fileName: "Cryptex-Mini_Part2.gcode.3mf", defaultTags: ["Bambu P1P", "PLA"], printHours: 1, printMins: 0, zHeight: 0.2, filamentWeight: 24, fileFolders: ["All", "Games"] });
  addFile({ fileName: "Warhammer_Mini-Base32mm.gcode.3mf", defaultTags: ["Bambu A1 Mini", "PLA"], printHours: 0, printMins: 20, zHeight: 0.16, filamentWeight: 6, fileFolders: ["All", "Games"] });
  addFile({ fileName: "Marble-Run_Track-SectionA.gcode", defaultTags: ["Prusa Mk3", "PLA"], printHours: 1, printMins: 30, zHeight: 0.28, filamentWeight: 34, fileFolders: ["All", "Games"] });
  addFile({ fileName: "Marble-Run_Track-Loop.gcode", defaultTags: ["CR10", "PLA"], printHours: 1, printMins: 50, zHeight: 0.28, filamentWeight: 40, fileFolders: ["All", "Games"] });
  addFile({ fileName: "Working-Gearbox_Demo.gcode.3mf", defaultTags: ["Bambu X1C", "PETG"], printHours: 2, printMins: 30, zHeight: 0.2, filamentWeight: 51, fileFolders: ["All", "Games"] });
}
