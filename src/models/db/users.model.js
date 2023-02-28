module.exports = (sequelize,DataTypes) =>{
    const User = sequelize.define("users",{
      user_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      email:{
        type: DataTypes.STRING(100),
        allowNull: false
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      user_type:{
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue:"USER"//ADMIN
      },
      is_active:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false
      }
    },
    {freezeTableName: true,
     timestamps:true});

    


    return User;
}