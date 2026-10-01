export const DEFAULT_OFFICE_TEMPLATES = [
  {
    id: "tpl_office_cleaning_hygiene",
    title: "Comprehensive Office Cleaning & Toilet Sanitation Audit",
    category: "Cleaning & Hygiene",
    description: "Detailed daily/weekly inspection of restrooms, workstations, pantry, common areas, and waste disposal.",
    icon: "Sparkles",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: "sec_restroom",
        title: "🚽 Restrooms & Toilets Sanitation",
        description: "Mandatory hygiene check for male, female, and accessible restrooms.",
        items: [
          {
            id: "item_toilet_bowls",
            label: "Toilet bowls & urinals sanitized, descaled, and stain-free",
            type: "pass_fail",
            weight: 10,
            required: true,
            notes: ""
          },
          {
            id: "item_soap_dispenser",
            label: "Hand soap dispensers refilled and fully functional",
            type: "pass_fail",
            weight: 8,
            required: true,
            notes: ""
          },
          {
            id: "item_paper_dryer",
            label: "Hand paper towels stocked & hand dryers operating properly",
            type: "pass_fail",
            weight: 8,
            required: true,
            notes: ""
          },
          {
            id: "item_mirrors_counter",
            label: "Mirrors, sinks & faucets polished without water spots",
            type: "pass_fail",
            weight: 5,
            required: false,
            notes: ""
          },
          {
            id: "item_restroom_floor",
            label: "Restroom floors mopped with disinfectant & dry (no slip hazard)",
            type: "pass_fail",
            weight: 10,
            required: true,
            notes: ""
          },
          {
            id: "item_restroom_trash",
            label: "Sanitary bins emptied & fresh bags lined",
            type: "pass_fail",
            weight: 8,
            required: true,
            notes: ""
          },
          {
            id: "item_restroom_odor",
            label: "Restrooms free of foul odor & air freshener active",
            type: "pass_fail",
            weight: 5,
            required: false,
            notes: ""
          }
        ]
      },
      {
        id: "sec_workstations",
        title: "🧼 Workstation & Desk Hygiene",
        description: "General office floor & desk sanitation check.",
        items: [
          {
            id: "item_desk_dusting",
            label: "Desk surfaces wiped and dust-free",
            type: "pass_fail",
            weight: 5,
            required: true,
            notes: ""
          },
          {
            id: "item_desk_trash",
            label: "Personal desk waste bins emptied",
            type: "pass_fail",
            weight: 5,
            required: false,
            notes: ""
          },
          {
            id: "item_monitors_keyboards",
            label: "Shared monitors, keyboards & mice disinfected",
            type: "pass_fail",
            weight: 5,
            required: false,
            notes: ""
          },
          {
            id: "item_cable_safety",
            label: "Under-desk power cables organized without tripping risk",
            type: "pass_fail",
            weight: 7,
            required: true,
            notes: ""
          }
        ]
      },
      {
        id: "sec_pantry",
        title: "☕ Pantry & Breakroom Sanitation",
        description: "Kitchenette, coffee machine, fridge, and eating area health check.",
        items: [
          {
            id: "item_pantry_fridge",
            label: "Refrigerator interior clean, no expired food items left",
            type: "pass_fail",
            weight: 6,
            required: true,
            notes: ""
          },
          {
            id: "item_microwave_coffee",
            label: "Microwaves, coffee machines & water dispensers cleaned & sanitized",
            type: "pass_fail",
            weight: 8,
            required: true,
            notes: ""
          },
          {
            id: "item_sink_dishes",
            label: "Sink clear of dirty dishes; dish soap & sponge stocked",
            type: "pass_fail",
            weight: 7,
            required: true,
            notes: ""
          },
          {
            id: "item_dining_tables",
            label: "Pantry tables wiped clean with antibacterial spray",
            type: "pass_fail",
            weight: 6,
            required: true,
            notes: ""
          }
        ]
      },
      {
        id: "sec_waste_floors",
        title: "🧹 Common Area Floors & Waste Management",
        description: "Hallways, carpet vacuuming, glass doors, and central recycling.",
        items: [
          {
            id: "item_carpet_floor",
            label: "Carpets vacuumed & hard floors mopped across all office zones",
            type: "pass_fail",
            weight: 10,
            required: true,
            notes: ""
          },
          {
            id: "item_glass_doors",
            label: "Main entry glass doors & partitions free of smudge/fingerprints",
            type: "pass_fail",
            weight: 5,
            required: false,
            notes: ""
          },
          {
            id: "item_central_trash",
            label: "Central office waste & recycling stations emptied to main dumpster",
            type: "pass_fail",
            weight: 8,
            required: true,
            notes: ""
          }
        ]
      }
    ]
  },
  {
    id: "tpl_office_safety_fire",
    title: "Office Safety & Fire Preparedness Walkthrough",
    category: "Safety & Compliance",
    description: "Inspection of fire extinguishers, exit signs, first aid kits, and emergency pathways.",
    icon: "ShieldAlert",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: "sec_fire_safety",
        title: "🧯 Fire & Emergency Equipment",
        description: "Verify all life-safety devices are accessible and certified.",
        items: [
          {
            id: "item_extinguishers",
            label: "Fire extinguishers present, pressure gauge in GREEN zone, unblocked",
            type: "pass_fail",
            weight: 15,
            required: true,
            notes: ""
          },
          {
            id: "item_exit_routes",
            label: "Emergency exit doors & stairwells completely clear of boxes/obstacles",
            type: "pass_fail",
            weight: 15,
            required: true,
            notes: ""
          },
          {
            id: "item_exit_lights",
            label: "Illuminated EXIT signs functioning properly",
            type: "pass_fail",
            weight: 10,
            required: true,
            notes: ""
          },
          {
            id: "item_first_aid",
            label: "First Aid kit fully stocked with non-expired bandages & antiseptics",
            type: "pass_fail",
            weight: 10,
            required: true,
            notes: ""
          }
        ]
      }
    ]
  },
  {
    id: "tpl_facility_hvac_it",
    title: "Office HVAC, Facilities & IT Server Room Check",
    category: "Facilities & IT",
    description: "Air conditioning monitoring, server room temperature, electrical panels, and security.",
    icon: "Server",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: "sec_hvac",
        title: "❄️ HVAC & Climate Control",
        description: "Office temperature and ventilation check.",
        items: [
          {
            id: "item_ac_temp",
            label: "Office ambient temperature maintained between 21°C - 24°C",
            type: "number",
            targetRange: "21-24",
            weight: 8,
            required: true,
            notes: ""
          },
          {
            id: "item_ac_leaks",
            label: "No water condensation leaks from wall/ceiling AC units",
            type: "pass_fail",
            weight: 10,
            required: true,
            notes: ""
          }
        ]
      },
      {
        id: "sec_it_server",
        title: "🖥️ IT Server Room & Access Control",
        description: "Critical server room infrastructure.",
        items: [
          {
            id: "item_server_ac",
            label: "Dedicated server room AC operating correctly (< 20°C)",
            type: "pass_fail",
            weight: 15,
            required: true,
            notes: ""
          },
          {
            id: "item_server_lock",
            label: "Server room access door locked and access logs active",
            type: "pass_fail",
            weight: 10,
            required: true,
            notes: ""
          },
          {
            id: "item_ups_status",
            label: "UPS battery backup status indicator NORMAL without fault warnings",
            type: "pass_fail",
            weight: 12,
            required: true,
            notes: ""
          }
        ]
      }
    ]
  },
  {
    id: "tpl_daily_office_opening",
    title: "Daily Office Opening & Closing Audit",
    category: "Operations",
    description: "Daily routine checklist for facility managers and office openers/closers.",
    icon: "Key",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: "sec_opening",
        title: "🌅 Morning Opening Checklist",
        description: "Daily routine at 08:00 AM.",
        items: [
          {
            id: "item_main_door",
            label: "Main door security alarm disarmed & entry access active",
            type: "pass_fail",
            weight: 10,
            required: true,
            notes: ""
          },
          {
            id: "item_lights_ac_on",
            label: "Common area lights & main AC units switched ON",
            type: "pass_fail",
            weight: 8,
            required: true,
            notes: ""
          },
          {
            id: "item_water_coffee_on",
            label: "Pantry water dispenser & coffee machine powered ON",
            type: "pass_fail",
            weight: 6,
            required: false,
            notes: ""
          }
        ]
      },
      {
        id: "sec_closing",
        title: "🌙 Evening Closing Checklist",
        description: "Daily routine at 06:30 PM.",
        items: [
          {
            id: "item_windows_doors",
            label: "All perimeter windows closed & emergency doors secured",
            type: "pass_fail",
            weight: 10,
            required: true,
            notes: ""
          },
          {
            id: "item_power_off",
            label: "Non-essential lights, monitors & pantry appliances turned OFF",
            type: "pass_fail",
            weight: 10,
            required: true,
            notes: ""
          },
          {
            id: "item_alarm_set",
            label: "Main security alarm armed and final entrance door double-locked",
            type: "pass_fail",
            weight: 15,
            required: true,
            notes: ""
          }
        ]
      }
    ]
  }
];
