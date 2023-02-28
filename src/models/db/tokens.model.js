module.exports = (sequelize,DataTypes) =>{
    const Tokens = sequelize.define("tokens",{
      token_is: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      token: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      type:{//image reference
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue:"AUTHENTICATION" //PASSWORD_RESET ect
      },
      active:{
        type: DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true
      }
    },
    {freezeTableName: true,
     timestamps:true});

    return Tokens;
}