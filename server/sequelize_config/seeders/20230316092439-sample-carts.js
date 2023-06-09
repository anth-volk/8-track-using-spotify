'use strict';

const { query } = require('express');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

	await queryInterface.bulkInsert(
		'Carts',
		[
			{
				cart_id: '52a7b0b2-fa0c-43a4-8591-46b36beac1ef',
				user_id: '52a7b0b2-fa0c-43a4-8591-46b36beac1ee',
				cart_name: 'TestVal',
				track1_link: 'http://wwww.google.com/',
				track1_fade_out_seconds: 0,
				track2_link: 'http://wwww.google.com/',
				track2_fade_out_seconds: 2,
				track3_link: 'http://wwww.google.com/',
				track3_fade_out_seconds: 100,
				track4_link: 'http://wwww.google.com/',
				track4_fade_out_seconds: 1000,
				createdAt: new Date(),
				updatedAt: new Date()
			}
		],
		{}
	);

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
	await queryInterface.bulkDelete(
		'carts',
		null,
		{}
	);

  }
};
