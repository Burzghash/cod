/**
 * Extend the basic ItemSheet
 * @extends {ItemSheet}
 */

export class CoDItemSheet extends ItemSheet {
	// Extend and override the default options

	static get defaultOptions() {
		const options = super.defaultOptions;
		const path = 'systems/cod/templates/items';
		options.tabs = [
			{
				navSelector: '.tabs',
				contentSelector: '.content',
				initial: 'attributes',
			},
		];
		options.classes = options.classes.concat(['cod', 'item-sheet']);
		options.template = `systems/${game.system.id}/templates/items/item-sheet.html`;
		options.system_path = `systems/${game.system.id}`;
		options.height = 450;
		return options;
	}

	//Use a type-specific template for each different item type

	get template() {
		let type = this.item.type;
		const path = 'systems/cod/templates/items';
		return `${path}/item-${type}-sheet.html`;
	}

	getData() {
		const data = super.getData();
		if (this.item.type == 'weapon') data['attacks'] = CONFIG.attacks;
		if (this.item.type == 'merit')
			data['meritGroups'] = CONFIG.universalMeritGroups;
		console.log(`Current state of item-sheet data:`);
		console.log(data);
		console.log(`------------------`);
		return data;
	}

	// Activate event listeners using the prepared sheet HTML
	//* @param html {HTML}   The prepared HTML object ready to be rendered into the DOM

	activateListeners(html) {
		super.activateListeners(html);
	}
}
