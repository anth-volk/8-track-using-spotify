'use strict';

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
		'Users', 
		[
			{
				user_id: '52a7b0b2-fa0c-43a4-8591-46b36beac1ee',
				email: 'testVal@test.com',
				password_hash: 'unknownSampleValue22657sh34asv',
				first_name: 'Test',
				last_name: 'Value',
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
	return await queryInterface.bulkDelete('users', null, {});
  }
};
