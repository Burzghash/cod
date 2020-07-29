/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class CoDItem extends Item {
	/**
	 * Augment the basic Item data model with additional dynamic data.
	 */
	prepareData() {
		super.prepareData();

		// Get the Item's data
		const itemData = this.data;
		const actorData = this.actor ? this.actor.data : {};
		const data = itemData.data;

		console.log(`Current state of item data:`);
		console.log(itemData);
		console.log(`------------------`);
	}

	/**
	 * Handle clickable rolls.
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async roll() {
		// Basic template rendering data
		const item = this.data;
		const itemData = item.data;
		const actorData = this.actor ? this.actor.data.data : {};
		const attributes = this.actor.sheet.sortAttrGroups();
		const skills = this.actor.sheet.sortSkillGroups();
		console.log(attributes);
		console.log(skills);

		if (item.type === 'weapon') {
			let weaponName = item.name;
			let attackType = item.data.attack.value;
			let damage = item.data.damage.value;
			let formula = CONFIG.attackSkills[attackType];
			formula = formula.split(',');
			// Formula[0] = attribute, Formula[1] = skill (e.g., 'str', 'brawl')
			let defaultSelectionAtt = formula[0];
			let defaultSelectionSkill = formula[1];

			let dialogData = {
				defaultSelectionAtt: defaultSelectionAtt,
				defaultSelectionSkill: defaultSelectionSkill,
				skills: skills,
				attributes: attributes,
				groups: CONFIG.groups,
			};

			// If a target is selected
			if (game.user.targets.size == 1) {
				let target = game.user.targets.values().next().value.actor.data.name;
				let targetDef =
					-1 *
					game.user.targets.values().next().value.actor.data.data.advantages.def
						.value;

				if (attackType === 'ranged') {
					console.log(`Target's defense not applied`);
					this.actor.weaponRollPool(
						formula[0],
						formula[1],
						0,
						'ten',
						weaponName,
						damage,
						target
					);
					console.log(``);
				} else {
					this.actor.weaponRollPool(
						formula[0],
						formula[1],
						targetDef,
						'ten',
						weaponName,
						damage,
						target
					);
					console.log(``);
				}
			} else {
				// If no target selected, create popup dialogue
				renderTemplate(
					'systems/cod/templates/pool-dialog.html',
					dialogData
				).then((html) => {
					new Dialog({
						title: 'Roll Dice Pool',
						content: html,
						buttons: {
							Yes: {
								icon: '<i class="fa fa-check"></i>',
								label: 'Yes',
								callback: (html) => {
									let attributeSelected = html
										.find('[name="attributeSelector"]')
										.val();
									let poolModifier = html.find('[name="modifier"]').val();
									let skillSelected = html.find('[name="skillSelector"]').val();
									let exploderSelected = html
										.find('[name="exploderSelector"]')
										.val();
									if (attributeSelected === 'none' || skillSelected === 'none')
										console.log(`Invalid pool selected.`);
									else
										this.actor.weaponRollPool(
											attributeSelected,
											skillSelected,
											poolModifier,
											exploderSelected,
											weaponName,
											damage,
											'none'
										);
									console.log(``);
								},
							},
							cancel: {
								icon: '<i class="fas fa-times"></i>',
								label: 'Cancel',
							},
						},
						default: 'Yes',
					}).render(true);
				});
			}
		} else return;
	}
}
