'use strict';

import bcrypt from 'bcrypt';
export const up = async (queryInterface, Sequelize) => {
  const hashedPassword = await bcrypt.hash('password123', 10);  // Hachage du mot de passe

  await queryInterface.bulkInsert('users', [
    {
      nom: 'elghazrani',
      prenom: 'jihane',
      email: 'elghazranijihane@gmail.com',
      password: 'jihane05',
      niveau: 'GINF2',
      secretCode: 200520,
      bio: null,
      photo: null,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      nom: 'moukhliss',
      prenom: 'riyad',
      email: 'moukhlissriyad@gmail.com',
      password: 'riyad04',
      niveau: 'GINF2',
      secretCode: 200421,
      bio: null,
      photo: null ,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.bulkDelete('users', null, {});
};
