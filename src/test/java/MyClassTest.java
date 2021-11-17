import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MyClassTest {

    @BeforeEach
    public void setUp() {

    }

    @Test
    void sum() {
        MyClass myClass=new MyClass(10,20);
        Assertions.assertEquals(myClass.sum(),30);
    }

    @Test
    void mul() {
        fail("Not implemented");
    }
}