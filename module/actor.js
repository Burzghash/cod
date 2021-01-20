/**
 * Extend the base Actor entity by defining custom roll structures.
 * @extends {Actor}
 */

export class ActorCoD extends Actor {
	prepareData() {
		super.prepareData();

		const actorData = this.data;
		const data = actorData.data;
		const flags = actorData.flags;

		// Make separate methods for each Actor type (character, npc, etc.) to keep
		// things organized.
		if (actorData.type === 'character') this._prepareCharacterData(actorData);
		console.log(`Current state of actor:`);
		console.log(actorData);
		console.log(`------------------`);
	}

	// Prepare character data
	_prepareCharacterData(actorData) {
		const data = actorData.data;
		const attributeList = duplicate(CONFIG.attributes);
		const skillsList = duplicate(CONFIG.skills);
		const {wits, res, str, dex, sta, com} = data.attributes;

		const athletics = data.skills.athletics;
		const {hp, wp, integrity, size, speed, def, garmor, barmor, initiative} = data.advantages;
		const {exp, beats} = data.advancement;

		// Check to see if current HP/WP > max, correct if so
		if (hp.value > hp.max) hp.value = hp.max;
		if (hp.value < hp.min) hp.value = hp.min;
		if (wp.value > wp.max) wp.value = wp.max;
		if (wp.value < wp.min) wp.value = wp.min;

		// Ensure Intrgrity is valid
		if (integrity.value < integrity.min) integrity.value = integrity.min;
		if (integrity.value > integrity.max) integrity.value = integrity.max;

		// Ensure Attributes and Skills are appropriate values
		for (let a in attributeList) {
			if (data.attributes[a].value > data.attributes[a].max)
				data.attributes[a].value = data.attributes[a].max;
			if (data.attributes[a].value < data.attributes[a].min)
				data.attributes[a].value = data.attributes[a].min;
		}

		for (let s in skillsList) {
			if (data.skills[s].value > data.skills[s].max)
				data.skills[s].value = data.skills[s].max;
			if (data.skills[s].value < data.skills[s].min)
				data.skills[s].value = data.skills[s].min;
		}

		// Ensure others are valid
		if (size.value < size.min) size.value = size.min;
		if (garmor.value < garmor.min) garmor.value = garmor.min;
		if (barmor.value < barmor.min) barmor.value = barmor.min;
		if (exp.value < exp.min) exp.value = exp.min;
		if (beats.value < beats.min) beats.value = beats.min;

		// Using correct values, define derived character values
		hp.max = sta.value + size.value;
		wp.max = res.value + com.value;
		def.value = Math.min(wits.value, dex.value) + athletics.value;
		initiative.value = dex.value + com.value;
		speed.value = str.value + dex.value + 5;

		// Convert beats to exp as appropriate
		if (beats.value >= 5) {
			exp.value += Math.round(beats.value / 5);
			beats.value = beats.value % 5;
		}
	}

	// Standard attribute + skill roll
	rollPool(attribute, skill, modifier, exploder) {
		// Ex: 'int', 'animalken', 'ten'. Define global roll pool, assume valid att
		// & skill sent even if 0 or negative value.
		let name = this.name;
		let pool = 0;
		let attVal = parseInt(this.data.data.attributes[attribute].value, 10);
		let skillVal = parseInt(this.data.data.skills[skill].value, 10);
		let attGroup = CONFIG.groupMapping[attribute];
		let skillGroup = CONFIG.groupMapping[skill];
		let modVal = parseInt(modifier, 10) || 0;
		let penalty = 0;
		let penaltyStr = '';
		let explodeStr = 'x10';

		// Determine if inadequate skill
		if (skillVal < 1) {
			if (skillGroup === 'mental') penalty = -3;
			else penalty = -1;
		}
		if (penalty < 0)
			penaltyStr = `<br> Insufficient skill! Penalty of ${penalty}`;

		// Determine exploder
		switch (exploder) {
			case 'none':
				explodeStr = '';
				break;
			case 'ten':
				explodeStr = 'x10';
				break;
			case 'nine':
				explodeStr = 'x>=9';
				break;
			case 'eight':
				explodeStr = 'x>=8';
				break;
		}

		console.log(`--------------`);
		console.log(
			`Initial roll pool: ${attribute} : ${attVal}, ${skill} : ${skillVal}, Mod : ${modVal}`
		);
		console.log(`Att: ${attGroup}, Skill: ${skillGroup}`);
		console.log(`Exploder: ${exploder}`);
		if (penalty < 0) console.log(`Penalty assessed: ${penalty}`);
		console.log(`--------------`);

		// Determine final roll pool
		pool = pool + attVal + skillVal + modVal + penalty;
		console.log(`Final roll pool: ${pool}`);
		console.log(`--------------`);

		if (pool > 0) {
			// Regular roll
			let roll = new Roll(`${pool}d10${explodeStr}cs>=8`).roll();
			roll.toMessage({
				flavor: `<b>${name}</b> makes a roll!<br>
					${CONFIG.attributes[attribute]}: ${attVal}<br>
					${CONFIG.skills[skill]}: ${skillVal}<br>
					Modifier: ${modVal}${penaltyStr}`,
			});
		} else {
			// Chance roll
			let roll = new Roll(`1d10cs=10`).roll();
			roll.toMessage({
				flavor: `<b>${name}</b> makes a roll!<br>
				${CONFIG.attributes[attribute]}: ${attVal}<br>
				${CONFIG.skills[skill]}: ${skillVal}<br> 
				Modifier: ${modVal} ${penaltyStr}<br>
			  Roll is reduced to a chance die!`,
			});
		}
	}

	// Attribute roll
	attTaskPool(attribute1, attribute2, modifier, exploder) {
		// Ex: 'wits', 'composure', 'ten'. Define global roll pool, assume 2 valid att's sent even if 0 or negative value.
		let name = this.name;
		let pool = 0;
		let att1Val;
		let att2Val;
		let att1String;
		let att2String;

		if (attribute1 == 'none') {
			att1Val = 0;
			att1String = 'None';
		} else {
			att1Val = parseInt(this.data.data.attributes[attribute1].value, 10);
			att1String = `${CONFIG.attributes[attribute1]}: ${att1Val}`;
		}

		if (attribute2 == 'none') {
			att2Val = 0;
			att2String = 'None';
		} else {
			att2Val = parseInt(this.data.data.attributes[attribute2].value, 10);
			att2String = `${CONFIG.attributes[attribute2]}: ${att2Val}`;
		}

		let att1Group = CONFIG.groupMapping[attribute1];
		let att2Group = CONFIG.groupMapping[attribute2];
		let modVal = parseInt(modifier, 10) || 0;
		let explodeStr = 'x10';

		// Determine exploder
		switch (exploder) {
			case 'none':
				explodeStr = '';
				break;
			case 'ten':
				explodeStr = 'x10';
				break;
			case 'nine':
				explodeStr = 'x>=9';
				break;
			case 'eight':
				explodeStr = 'x>=8';
				break;
		}

		console.log(`--------------`);
		console.log(
			`Initial roll pool: ${attribute1} : ${att1Val}, ${attribute2} : ${att2Val}, Mod : ${modVal}`
		);
		console.log(
			`Attribute 1 Group: ${att1Group}, Attribute 2 Group: ${att2Group}`
		);
		console.log(`Exploder: ${exploder}`);
		console.log(`--------------`);

		// Determine final roll pool
		pool = pool + att1Val + att2Val + modVal;
		console.log(`Final roll pool: ${pool}`);
		console.log(`--------------`);

		if (pool > 0) {
			// Regular roll
			let roll = new Roll(`${pool}d10${explodeStr}cs>=8`).roll();
			roll.toMessage({
				flavor: `<b>${name}</b> makes an Attribute roll!<br>
				${att1String}<br>
				${att2String}<br>
				Modifier: ${modVal}`,
			});
		} else {
			// Chance roll
			let roll = new Roll(`1d10cs=10`).roll();
			roll.toMessage({
				flavor: `<b>${name}</b> makes an Attribute roll!<br>
				${att1String}<br>
				${att2String}<br>
				Modifier: ${modVal}<br>
			  Roll is reduced to a chance die!`,
			});
		}
	}

	// Attack roll
	weaponRollPool(attribute, skill, modifier, exploder, weapon, damage, target) {
		// Ex: 'int', 'animalken', -1, 'ten', 'Axe', 'Ben'. Define global roll pool, assume valid att & skill sent even if 0 or negative value.
		let name = this.name;
		let pool = 0;
		let attVal = parseInt(this.data.data.attributes[attribute].value, 10);
		let skillVal = parseInt(this.data.data.skills[skill].value, 10);
		let attGroup = CONFIG.groupMapping[attribute];
		let skillGroup = CONFIG.groupMapping[skill];
		let modVal = parseInt(modifier, 10) || 0;
		let penalty = 0;
		let penaltyStr = '';
		let explodeStr = 'x10';
		let rollString;

		// Determine if inadequate skill
		if (skillVal < 1) {
			if (skillGroup === 'mental') penalty = -3;
			else penalty = -1;
		}
		if (penalty < 0)
			penaltyStr = `<br> Insufficient skill! Penalty of ${penalty}`;

		// Determine exploder
		switch (exploder) {
			case 'none':
				explodeStr = '';
				break;
			case 'ten':
				explodeStr = 'x10';
				break;
			case 'nine':
				explodeStr = 'x>=9';
				break;
			case 'eight':
				explodeStr = 'x>=8';
				break;
		}
		console.log(`Weapon roll: ${attribute}, ${skill}`);
		console.log(`Target: ${target}`);
		if (target === 'none')
			rollString = `<b>${name}</b> attacks with <b>${weapon}</b>! (${damage} dmg)`;
		else
			rollString = `<b>${name}</b> attacks <b>${target}</b> with <b>${weapon}</b>! (${damage} dmg)`;

		console.log(`--------------`);
		console.log(
			`Initial roll pool: ${attribute} : ${attVal}, ${skill} : ${skillVal}, Mod : ${modVal}`
		);
		console.log(`Att: ${attGroup}, Skill: ${skillGroup}`);
		console.log(`Exploder: ${exploder}`);
		if (penalty < 0) console.log(`Penalty assessed: ${penalty}`);
		console.log(`--------------`);

		// Determine final roll pool
		pool = pool + attVal + skillVal + modVal + penalty;
		console.log(`Final roll pool: ${pool}`);
		console.log(`--------------`);

		if (pool > 0) {
			// Regular roll
			let roll = new Roll(`${pool}d10${explodeStr}cs>=8`).roll();
			roll.toMessage({
				flavor: `${rollString}<br>
					${CONFIG.attributes[attribute]}: ${attVal}<br>
					${CONFIG.skills[skill]}: ${skillVal}<br>
					Modifier: ${modVal}${penaltyStr}`,
			});
		} else {
			// Chance roll
			let roll = new Roll(`1d10cs=10`).roll();
			roll.toMessage({
				flavor: `${rollString}<br>
				${CONFIG.attributes[attribute]}: ${attVal}<br>
				${CONFIG.skills[skill]}: ${skillVal}<br> 
				Modifier: ${modVal} ${penaltyStr}<br>
			  Roll is reduced to a chance die!`,
			});
		}
	}
}
