////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Date:           4/15/2020
//  Description:    See below...
//
////////////////////////////////////////////////////////////////////////////////
//
//  Honor Pledge:
//
//  I pledge that I have neither given nor received any help on this assignment.
//
//  ibsardar
//
////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2020 Copyright Holder All Rights Reserved.
//
////////////////////////////////////////////////////////////////////////////////

export { CombatManager, CombatManager as Combat }; // also export an alias

/**
 * @class CombatManager
 * 
 * Static class - handles various types of combat encounters.
 */
class CombatManager {

    /**
     * 
     * @param {Weapon} weapon 
     * @param {Actor} source 
     * @param {Actor} target 
     */
    static melee_vs_target(weapon, source, target) {

        // setup
        var new_health = target._health; // of defender
        var new_armor = target._armor; // of defender
        var new_dmg_normal = weapon._dmg_normal; // of attacker
        var new_dmg_pierce = weapon._dmg_pierce; // of attacker
        var new_dmg_break = weapon._dmg_break; // of attacker

        // loop thru all of defender's effects
        for (let e of target._effects) {
            var combat_data = e.run(weapon, null, source, target);
            new_armor += combat_data[3];
            new_health += combat_data[4];
        }

        // loop thru all of attacker's effects
        for (let e of source._effects) {

            // check resist from target
            if (e.resisted(target._resists))
                continue;

            var combat_data = e.run(weapon, null, source, target);
            new_dmg_normal += combat_data[0];
            new_dmg_pierce += combat_data[1];
            new_dmg_break += combat_data[2];
        }

        // loop thru all of weapon's effects (resist if necessary)
        for (let e of weapon._effects) {

            // check resist from target
            if (e.resisted(target._resists))
                continue;
            
            var combat_data = e.run(weapon, null, source, target);
            new_armor += combat_data[3];
            new_health += combat_data[4];
        }

        // calc totals
        new_armor -= new_dmg_break;
        new_health -= new_dmg_pierce;
        var remaining_armor = new_armor - new_dmg_normal;
        if (remaining_armor < 0) {
            new_armor = 0;
            new_health -= remaining_armor;
        } else
            new_armor = remaining_armor;

        // set final armor and health of target
        target._armor = new_armor;
        target._health = new_health;
    }

    /**
     * 
     * @param {Weapon} weapon 
     * @param {Armor} armor 
     * @param {Actor} source 
     * @param {Actor} target 
     */
    static melee_vs_armor(weapon, armor, source, target) {

        // setup
        var new_health = target._health; // of defender
        var new_armor = target._armor; // of defender
        var new_dmg_normal = weapon._dmg_normal; // of attacker
        var new_dmg_pierce = weapon._dmg_pierce; // of attacker
        var new_dmg_break = weapon._dmg_break; // of attacker

        // loop thru all of defender's effects
        for (let e of target._effects) {
            var combat_data = e.run(weapon, armor, source, target);
            new_armor += combat_data[3];
            new_health += combat_data[4];
        }

        // loop thru all of armor's effects
        for (let e of armor._effects) {
            var combat_data = e.run(weapon, armor, source, target);
            new_armor += combat_data[3];
            new_health += combat_data[4];
        }

        // loop thru all of attacker's effects
        var skip;
        for (let e of source._effects) {

            // check resist from armor
            if (e.resisted(armor._resists))
                continue;

            // check resist from target
            if (e.resisted(target._resists))
                continue;

            var combat_data = e.run(weapon, armor, source, target);
            new_dmg_normal += combat_data[0];
            new_dmg_pierce += combat_data[1];
            new_dmg_break += combat_data[2];
        }

        // loop thru all of weapon's effects (resist if necessary)
        for (let e of weapon._effects) {

            // check resist from armor
            if (e.resisted(armor._resists))
                continue;

            // check resist from target
            if (e.resisted(target._resists))
                continue;
            
            var combat_data = e.run(weapon, armor, source, target);
            new_armor += combat_data[3];
            new_health += combat_data[4];
        }

        // calc totals
        new_armor -= new_dmg_break;
        new_health -= new_dmg_pierce;
        var remaining_armor = new_armor - new_dmg_normal;
        if (remaining_armor < 0) {
            new_armor = 0;
            new_health -= remaining_armor;
        } else
            new_armor = remaining_armor;

        // set final armor and health of target
        target._armor = new_armor;
        target._health = new_health;
    }

    /**
     * 
     * @param {Projectiile} projectile 
     * @param {Armor} armor 
     * @param {Actor} source 
     * @param {Actor} target 
     */
    static ranged_vs_target(projectile, source, target) {

        // setup
        var new_health = target._health; // of defender
        var new_armor = target._armor; // of defender
        var new_dmg_normal = projectile._dmg_normal; // of attacker
        var new_dmg_pierce = projectile._dmg_pierce; // of attacker
        var new_dmg_break = projectile._dmg_break; // of attacker

        // loop thru all of defender's effects
        for (let e of target._effects) {
            var combat_data = e.run(projectile, null, source, target);
            new_armor += combat_data[3];
            new_health += combat_data[4];
        }

        // loop thru all of attacker's effects
        for (let e of source._effects) {

            // check resist from target
            if (e.resisted(target._resists))
                continue;

            var combat_data = e.run(projectile, null, source, target);
            new_dmg_normal += combat_data[0];
            new_dmg_pierce += combat_data[1];
            new_dmg_break += combat_data[2];
        }

        // loop thru all of projectile's effects (resist if necessary)
        for (let e of projectile._effects) {

            // check resist from target
            if (e.resisted(target._resists))
                continue;
            
            var combat_data = e.run(projectile, null, source, target);
            new_armor += combat_data[3];
            new_health += combat_data[4];
        }

        // calc totals
        new_armor -= new_dmg_break;
        new_health -= new_dmg_pierce;
        var remaining_armor = new_armor - new_dmg_normal;
        if (remaining_armor < 0) {
            new_armor = 0;
            new_health -= remaining_armor;
        } else
            new_armor = remaining_armor;

        // set final armor and health of target
        target._armor = new_armor;
        target._health = new_health;
    }

    /**
     * 
     * @param {Weapon} projectile 
     * @param {Armor} armor 
     * @param {Actor} source 
     * @param {Actor} target 
     */
    static ranged_vs_armor(projectile, armor, source, target) {

        // setup
        var new_health = target._health; // of defender
        var new_armor = target._armor; // of defender
        var new_dmg_normal = projectile._dmg_normal; // of attacker
        var new_dmg_pierce = projectile._dmg_pierce; // of attacker
        var new_dmg_break = projectile._dmg_break; // of attacker

        // loop thru all of defender's effects
        for (let e of target._effects) {
            var combat_data = e.run(projectile, armor, source, target);
            new_armor += combat_data[3];
            new_health += combat_data[4];
        }

        // loop thru all of armor's effects
        for (let e of armor._effects) {
            var combat_data = e.run(projectile, armor, source, target);
            new_armor += combat_data[3];
            new_health += combat_data[4];
        }

        // loop thru all of attacker's effects
        for (let e of source._effects) {

            // check resist from armor
            if (e.resisted(armor._resists))
                continue;

            // check resist from target
            if (e.resisted(target._resists))
                continue;

            var combat_data = e.run(projectile, armor, source, target);
            new_dmg_normal += combat_data[0];
            new_dmg_pierce += combat_data[1];
            new_dmg_break += combat_data[2];
        }

        // loop thru all of projectile's effects (resist if necessary)
        for (let e of projectile._effects) {

            // check resist from armor
            if (e.resisted(armor._resists))
                continue;

            // check resist from target
            if (e.resisted(target._resists))
                continue;
            
            var combat_data = e.run(projectile, armor, source, target);
            new_armor += combat_data[3];
            new_health += combat_data[4];
        }

        // calc totals
        new_armor -= new_dmg_break;
        new_health -= new_dmg_pierce;
        var remaining_armor = new_armor - new_dmg_normal;
        if (remaining_armor < 0) {
            new_armor = 0;
            new_health -= remaining_armor;
        } else
            new_armor = remaining_armor;

        // set final armor and health of target
        target._armor = new_armor;
        target._health = new_health;
    }

    /**
     * 
     * 
     * @param {Hazard} hazard 
     * @param {Actor} source 
     * @param {Actor} target 
     */
    static hazard_vs_target(hazard, source, target) {

        // setup
        var new_health = target._health; // of defender
        var new_armor = target._armor; // of defender
        var new_dmg_normal = hazard._dmg_normal; // of attacker
        var new_dmg_pierce = hazard._dmg_pierce; // of attacker
        var new_dmg_break = hazard._dmg_break; // of attacker

        // loop thru all of defender's effects
        for (let e of target._effects) {
            var combat_data = e.run(hazard, null, source, target);
            new_armor += combat_data[3];
            new_health += combat_data[4];
        }

        // loop thru all of attacker's effects
        for (let e of source._effects) {

            // check resist from target
            if (e.resisted(target._resists))
                continue;

            var combat_data = e.run(hazard, null, source, target);
            new_dmg_normal += combat_data[0];
            new_dmg_pierce += combat_data[1];
            new_dmg_break += combat_data[2];
        }

        // loop thru all of hazard's effects (resist if necessary)
        for (let e of hazard._effects) {

            // check resist from target
            if (e.resisted(target._resists))
                continue;
            
            var combat_data = e.run(hazard, null, source, target);
            new_armor += combat_data[3];
            new_health += combat_data[4];
        }

        // calc totals
        new_armor -= new_dmg_break;
        new_health -= new_dmg_pierce;
        var remaining_armor = new_armor - new_dmg_normal;
        if (remaining_armor < 0) {
            new_armor = 0;
            new_health -= remaining_armor;
        } else
            new_armor = remaining_armor;

        // set final armor and health of target
        target._armor = new_armor;
        target._health = new_health;
    }

    /**
     * 
     * @param {*} effect 
     * @param {*} target 
     */
    static effect_vs_target(effect, target) {

        // setup
        var new_health = target._health; // of defender
        var new_armor = target._armor; // of defender
        var new_dmg_normal = 0; // of effect
        var new_dmg_pierce = 0; // of effect
        var new_dmg_break = 0; // of effect

        // check resist from target
        if (effect.resisted(target._resists))
            return;

        // loop thru all of defender's effects
        for (let e of target._effects) {
            var combat_data = e.run(hazard, null, source, target);
            new_armor += combat_data[3];
            new_health += combat_data[4];
        }

        // apply effect
        var combat_data = effect.run(effect, null, null, target);
        new_dmg_normal += combat_data[0];
        new_dmg_pierce += combat_data[1];
        new_dmg_break += combat_data[2];
        new_armor += combat_data[3];
        new_health += combat_data[4];

        // calc totals
        new_armor -= new_dmg_break;
        new_health -= new_dmg_pierce;
        var remaining_armor = new_armor - new_dmg_normal;
        if (remaining_armor < 0) {
            new_armor = 0;
            new_health -= remaining_armor;
        } else
            new_armor = remaining_armor;

        // set final armor and health of target
        target._armor = new_armor;
        target._health = new_health;
    }

}//end class