module.exports = (sequelize,DataTypes) =>{
    const Gender = sequelize.define("genders",{
      gender_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      gender:{
        type: DataTypes.STRING(100),
        allowNull: false,
      }
    },
    {freezeTableName: true,
     timestamps:true});

    return Gender;
}